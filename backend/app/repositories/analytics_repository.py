from datetime import date, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.calendar_event import CalendarEvent
from app.models.study_session import StudySession
from app.models.task import Task


class AnalyticsRepository:
    """Read-only queries that power analytics aggregations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    # ── Task queries ─────────────────────────────────────────────────────────

    def count_completed_tasks_since(self, workspace_id: str, since: datetime) -> int:
        return (
            self.db.query(Task)
            .filter(
                Task.workspace_id == workspace_id,
                Task.completed.is_(True),
                Task.updated_at >= since,
            )
            .count()
        )

    def get_completed_task_dates(self, workspace_id: str, since: datetime) -> set[date]:
        rows = (
            self.db.query(Task.updated_at)
            .filter(
                Task.workspace_id == workspace_id,
                Task.completed.is_(True),
                Task.updated_at >= since,
            )
            .all()
        )
        return {row[0].date() if hasattr(row[0], "date") else row[0] for row in rows if row[0]}

    def get_upcoming_task_deadlines(
        self, workspace_id: str, from_date: date, to_date: date
    ) -> list[Task]:
        return (
            self.db.query(Task)
            .filter(
                Task.workspace_id == workspace_id,
                Task.completed.is_(False),
                Task.due_date.is_not(None),
                Task.due_date >= from_date,
                Task.due_date <= to_date,
            )
            .order_by(Task.due_date.asc())
            .all()
        )

    # ── Study session queries ─────────────────────────────────────────────────

    def sum_study_seconds_since(self, workspace_id: str, since: datetime) -> int:
        result = (
            self.db.query(func.sum(StudySession.actual_duration))
            .filter(
                StudySession.workspace_id == workspace_id,
                StudySession.ended_at.is_not(None),
                StudySession.ended_at >= since,
            )
            .scalar()
        )
        return int(result) if result else 0

    def count_completed_sessions(self, workspace_id: str) -> int:
        return (
            self.db.query(StudySession)
            .filter(
                StudySession.workspace_id == workspace_id,
                StudySession.completed.is_(True),
            )
            .count()
        )

    def get_completed_session_dates(self, workspace_id: str, since: datetime) -> set[date]:
        rows = (
            self.db.query(StudySession.ended_at)
            .filter(
                StudySession.workspace_id == workspace_id,
                StudySession.completed.is_(True),
                StudySession.ended_at >= since,
            )
            .all()
        )
        return {row[0].date() if hasattr(row[0], "date") else row[0] for row in rows if row[0]}

    # ── Calendar event queries ────────────────────────────────────────────────

    def get_upcoming_calendar_events(
        self,
        workspace_id: str,
        from_dt: datetime,
        to_dt: datetime,
        event_types: list[str],
    ) -> list[CalendarEvent]:
        return (
            self.db.query(CalendarEvent)
            .filter(
                CalendarEvent.workspace_id == workspace_id,
                CalendarEvent.start_time >= from_dt,
                CalendarEvent.start_time <= to_dt,
                CalendarEvent.event_type.in_(event_types),
            )
            .order_by(CalendarEvent.start_time.asc())
            .all()
        )
