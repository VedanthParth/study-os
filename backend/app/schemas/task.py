from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

TaskPriority = Literal["low", "medium", "high"]


class TaskCreate(BaseModel):
    workspace_id: str
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(None, max_length=2000)
    priority: TaskPriority = "medium"
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    completed: bool | None = None
    priority: TaskPriority | None = None
    due_date: date | None = None


class TaskReorderItem(BaseModel):
    id: str
    position: int


class TaskReorder(BaseModel):
    items: list[TaskReorderItem]


class TaskResponse(BaseModel):
    id: str
    workspace_id: str
    title: str
    description: str | None
    completed: bool
    priority: TaskPriority
    due_date: date | None
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
