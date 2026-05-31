from datetime import UTC, date, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.analytics import AnalyticsOverviewResponse, UpcomingItem


def _utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _today_start() -> datetime:
    return _utc_now().replace(hour=0, minute=0, second=0, microsecond=0)


def _week_start() -> datetime:
    return _today_start() - timedelta(days=7)


def _streak_lookback() -> datetime:
    return _today_start() - timedelta(days=365)


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.repo = AnalyticsRepository(db)
        self.workspace_repo = WorkspaceRepository(db)

    def get_overview(self, workspace_id: str) -> AnalyticsOverviewResponse:
        if not self.workspace_repo.get_by_id(workspace_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found"
            )

        today = _today_start()
        week = _week_start()
        now = _utc_now()
        seven_days_ahead = now + timedelta(days=7)

        # ── Task stats ────────────────────────────────────────────────────────
        tasks_today = self.repo.count_completed_tasks_since(workspace_id, today)
        tasks_week = self.repo.count_completed_tasks_since(workspace_id, week)

        # ── Session stats ─────────────────────────────────────────────────────
        study_secs_today = self.repo.sum_study_seconds_since(workspace_id, today)
        study_secs_week = self.repo.sum_study_seconds_since(workspace_id, week)
        completed_sessions = self.repo.count_completed_sessions(workspace_id)

        # ── Streak ────────────────────────────────────────────────────────────
        streak_days = self._compute_streak(workspace_id)

        # ── Upcoming deadlines (task due dates + calendar deadline events) ────
        today_date = datetime.now(UTC).date()
        end_date = today_date + timedelta(days=7)

        task_deadlines = self.repo.get_upcoming_task_deadlines(workspace_id, today_date, end_date)
        cal_deadlines = self.repo.get_upcoming_calendar_events(
            workspace_id, now, seven_days_ahead, ["deadline"]
        )

        upcoming_deadlines: list[UpcomingItem] = []
        for task in task_deadlines:
            due = task.due_date
            upcoming_deadlines.append(
                UpcomingItem(
                    id=task.id,
                    title=task.title,
                    date=due.isoformat() if isinstance(due, date) else str(due),
                    item_type="task",
                )
            )
        for event in cal_deadlines:
            upcoming_deadlines.append(
                UpcomingItem(
                    id=event.id,
                    title=event.title,
                    date=event.start_time.date().isoformat()
                    if hasattr(event.start_time, "date")
                    else str(event.start_time)[:10],
                    item_type="deadline",
                )
            )
        upcoming_deadlines.sort(key=lambda i: i.date)

        # ── Upcoming events (exam calendar events) ────────────────────────────
        cal_events = self.repo.get_upcoming_calendar_events(
            workspace_id, now, seven_days_ahead, ["exam", "event"]
        )
        upcoming_events: list[UpcomingItem] = [
            UpcomingItem(
                id=ev.id,
                title=ev.title,
                date=ev.start_time.date().isoformat()
                if hasattr(ev.start_time, "date")
                else str(ev.start_time)[:10],
                item_type="exam" if ev.event_type == "exam" else "event",
            )
            for ev in cal_events
        ]

        return AnalyticsOverviewResponse(
            tasks_completed_today=tasks_today,
            tasks_completed_week=tasks_week,
            study_minutes_today=study_secs_today // 60,
            study_minutes_week=study_secs_week // 60,
            completed_sessions=completed_sessions,
            streak_days=streak_days,
            upcoming_deadlines=upcoming_deadlines,
            upcoming_events=upcoming_events,
        )

    def _compute_streak(self, workspace_id: str) -> int:
        lookback = _streak_lookback()
        task_dates = self.repo.get_completed_task_dates(workspace_id, lookback)
        session_dates = self.repo.get_completed_session_dates(workspace_id, lookback)
        active_dates = task_dates | session_dates

        today = datetime.now(UTC).date()
        streak = 0
        current = today
        while current in active_dates:
            streak += 1
            current -= timedelta(days=1)
        return streak
