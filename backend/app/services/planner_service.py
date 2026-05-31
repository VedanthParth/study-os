from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.study_plan import PlanItem, StudyPlan
from app.repositories.calendar_repository import CalendarRepository
from app.repositories.planner_repository import PlannerRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.planner import (
    PlanItemCreate,
    PlanItemResponse,
    PlanItemUpdate,
    StudyPlanCreate,
    StudyPlanResponse,
    StudyPlanUpdate,
)


class PlannerService:
    def __init__(self, db: Session) -> None:
        self.repo = PlannerRepository(db)
        self.workspace_repo = WorkspaceRepository(db)
        self.task_repo = TaskRepository(db)
        self.calendar_repo = CalendarRepository(db)

    def _require_workspace(self, workspace_id: str) -> None:
        if not self.workspace_repo.get_by_id(workspace_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    def _require_plan(self, plan_id: str) -> StudyPlan:
        plan = self.repo.get_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        return plan

    def _require_item(self, item_id: str) -> PlanItem:
        item = self.repo.get_item(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan item not found")
        return item

    def _validate_refs(self, task_id: str | None, event_id: str | None, workspace_id: str) -> None:
        if task_id is not None:
            task = self.task_repo.get_by_id(task_id)
            if not task:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
            if task.workspace_id != workspace_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Task does not belong to this workspace",
                )
        if event_id is not None:
            event = self.calendar_repo.get_by_id(event_id)
            if not event:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calendar event not found")
            if event.workspace_id != workspace_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Calendar event does not belong to this workspace",
                )

    # ── Plans ─────────────────────────────────────────────────────────────────

    def list_plans(self, workspace_id: str) -> list[StudyPlanResponse]:
        self._require_workspace(workspace_id)
        return [StudyPlanResponse.model_validate(p) for p in self.repo.list_plans(workspace_id)]

    def create_plan(self, payload: StudyPlanCreate) -> StudyPlanResponse:
        self._require_workspace(payload.workspace_id)
        for item in payload.items:
            self._validate_refs(item.task_id, item.calendar_event_id, payload.workspace_id)
        plan = self.repo.create_plan(
            payload.workspace_id, payload.title, payload.description, payload.items
        )
        return StudyPlanResponse.model_validate(plan)

    def get_plan(self, plan_id: str) -> StudyPlanResponse:
        return StudyPlanResponse.model_validate(self._require_plan(plan_id))

    def update_plan(self, plan_id: str, payload: StudyPlanUpdate) -> StudyPlanResponse:
        plan = self._require_plan(plan_id)
        return StudyPlanResponse.model_validate(self.repo.update_plan(plan, payload))

    def delete_plan(self, plan_id: str) -> None:
        self.repo.delete_plan(self._require_plan(plan_id))

    # ── Items ─────────────────────────────────────────────────────────────────

    def add_item(self, plan_id: str, payload: PlanItemCreate) -> PlanItemResponse:
        plan = self._require_plan(plan_id)
        self._validate_refs(payload.task_id, payload.calendar_event_id, plan.workspace_id)
        return PlanItemResponse.model_validate(self.repo.create_item(plan_id, payload))

    def update_item(self, item_id: str, payload: PlanItemUpdate) -> PlanItemResponse:
        item = self._require_item(item_id)
        updates = payload.model_dump(exclude_unset=True)
        if "task_id" in updates or "calendar_event_id" in updates:
            plan = self._require_plan(item.plan_id)
            self._validate_refs(
                updates.get("task_id", item.task_id),
                updates.get("calendar_event_id", item.calendar_event_id),
                plan.workspace_id,
            )
        return PlanItemResponse.model_validate(self.repo.update_item(item, payload))

    def delete_item(self, item_id: str) -> None:
        self.repo.delete_item(self._require_item(item_id))
