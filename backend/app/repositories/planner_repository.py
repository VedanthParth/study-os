from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.study_plan import PlanItem, StudyPlan
from app.schemas.planner import PlanItemCreate, PlanItemUpdate, StudyPlanUpdate


class PlannerRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    # ── Plans ─────────────────────────────────────────────────────────────────

    def list_plans(self, workspace_id: str) -> list[StudyPlan]:
        return (
            self.db.query(StudyPlan)
            .filter(StudyPlan.workspace_id == workspace_id)
            .order_by(StudyPlan.created_at.desc())
            .all()
        )

    def get_plan(self, plan_id: str) -> StudyPlan | None:
        return self.db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()

    def create_plan(
        self,
        workspace_id: str,
        title: str,
        description: str | None,
        items: list[PlanItemCreate],
    ) -> StudyPlan:
        plan = StudyPlan(workspace_id=workspace_id, title=title, description=description)
        self.db.add(plan)
        self.db.flush()  # obtain plan.id before creating items
        for item_data in items:
            self.db.add(PlanItem(plan_id=plan.id, **item_data.model_dump()))
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def update_plan(self, plan: StudyPlan, payload: StudyPlanUpdate) -> StudyPlan:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(plan, field, value)
        plan.updated_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def delete_plan(self, plan: StudyPlan) -> None:
        self.db.delete(plan)
        self.db.commit()

    # ── Items ─────────────────────────────────────────────────────────────────

    def get_item(self, item_id: str) -> PlanItem | None:
        return self.db.query(PlanItem).filter(PlanItem.id == item_id).first()

    def create_item(self, plan_id: str, payload: PlanItemCreate) -> PlanItem:
        item = PlanItem(plan_id=plan_id, **payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update_item(self, item: PlanItem, payload: PlanItemUpdate) -> PlanItem:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete_item(self, item: PlanItem) -> None:
        self.db.delete(item)
        self.db.commit()
