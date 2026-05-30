from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.calendar_event import CalendarEvent
from app.schemas.calendar_event import CalendarEventCreate, CalendarEventUpdate


class CalendarRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_workspace(self, workspace_id: str) -> list[CalendarEvent]:
        return (
            self.db.query(CalendarEvent)
            .filter(CalendarEvent.workspace_id == workspace_id)
            .order_by(CalendarEvent.start_time.asc())
            .all()
        )

    def get_by_id(self, event_id: str) -> CalendarEvent | None:
        return self.db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()

    def create(self, payload: CalendarEventCreate) -> CalendarEvent:
        event = CalendarEvent(**payload.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def update(self, event: CalendarEvent, payload: CalendarEventUpdate) -> CalendarEvent:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(event, field, value)
        event.updated_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: CalendarEvent) -> None:
        self.db.delete(event)
        self.db.commit()
