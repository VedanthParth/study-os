from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

CalendarEventType = Literal["study", "exam", "deadline", "event"]


class CalendarEventCreate(BaseModel):
    workspace_id: str
    task_id: str | None = None
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(None, max_length=2000)
    event_type: CalendarEventType
    start_time: datetime
    end_time: datetime


class CalendarEventUpdate(BaseModel):
    task_id: str | None = None
    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    event_type: CalendarEventType | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None


class CalendarEventResponse(BaseModel):
    id: str
    workspace_id: str
    task_id: str | None
    title: str
    description: str | None
    event_type: CalendarEventType
    start_time: datetime
    end_time: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
