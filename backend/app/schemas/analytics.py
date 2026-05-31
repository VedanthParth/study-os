from typing import Literal

from pydantic import BaseModel

UpcomingItemType = Literal["task", "deadline", "exam", "event"]


class UpcomingItem(BaseModel):
    id: str
    title: str
    date: str  # ISO date YYYY-MM-DD
    item_type: UpcomingItemType


class AnalyticsOverviewResponse(BaseModel):
    tasks_completed_today: int
    tasks_completed_week: int
    study_minutes_today: int
    study_minutes_week: int
    completed_sessions: int
    streak_days: int
    upcoming_deadlines: list[UpcomingItem]
    upcoming_events: list[UpcomingItem]
