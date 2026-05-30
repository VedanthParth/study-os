from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.calendar_event import CalendarEvent
from app.repositories.calendar_repository import CalendarRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.calendar_event import (
    CalendarEventCreate,
    CalendarEventResponse,
    CalendarEventUpdate,
)


def _to_utc_naive(dt: datetime) -> datetime:
    """Normalise to naive UTC for comparison, regardless of input tzinfo."""
    if dt.tzinfo is not None:
        return dt.astimezone(UTC).replace(tzinfo=None)
    return dt


class CalendarService:
    def __init__(self, db: Session) -> None:
        self.repo = CalendarRepository(db)
        self.workspace_repo = WorkspaceRepository(db)
        self.task_repo = TaskRepository(db)

    def _require_workspace(self, workspace_id: str) -> None:
        if not self.workspace_repo.get_by_id(workspace_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    def _require_event(self, event_id: str) -> CalendarEvent:
        event = self.repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return event

    def _validate_times(self, start: datetime, end: datetime) -> None:
        if _to_utc_naive(end) <= _to_utc_naive(start):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="end_time must be after start_time",
            )

    def _validate_task_workspace(self, task_id: str, workspace_id: str) -> None:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        if task.workspace_id != workspace_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task does not belong to this workspace",
            )

    def list_events(self, workspace_id: str) -> list[CalendarEventResponse]:
        self._require_workspace(workspace_id)
        return [CalendarEventResponse.model_validate(e) for e in self.repo.list_by_workspace(workspace_id)]

    def create_event(self, payload: CalendarEventCreate) -> CalendarEventResponse:
        self._require_workspace(payload.workspace_id)
        self._validate_times(payload.start_time, payload.end_time)
        if payload.task_id is not None:
            self._validate_task_workspace(payload.task_id, payload.workspace_id)
        event = self.repo.create(payload)
        return CalendarEventResponse.model_validate(event)

    def update_event(self, event_id: str, payload: CalendarEventUpdate) -> CalendarEventResponse:
        event = self._require_event(event_id)
        updates = payload.model_dump(exclude_unset=True)

        if "start_time" in updates or "end_time" in updates:
            new_start = updates.get("start_time", event.start_time)
            new_end = updates.get("end_time", event.end_time)
            self._validate_times(new_start, new_end)

        if "task_id" in updates and updates["task_id"] is not None:
            self._validate_task_workspace(updates["task_id"], event.workspace_id)

        updated = self.repo.update(event, payload)
        return CalendarEventResponse.model_validate(updated)

    def delete_event(self, event_id: str) -> None:
        event = self._require_event(event_id)
        self.repo.delete(event)
