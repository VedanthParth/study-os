from datetime import date, datetime

from pydantic import BaseModel, Field


class PlanItemCreate(BaseModel):
    task_id: str | None = None
    calendar_event_id: str | None = None
    title: str = Field(..., min_length=1, max_length=500)
    recommendation_reason: str | None = Field(None, max_length=2000)
    scheduled_date: date
    order_index: int = 0


class PlanItemUpdate(BaseModel):
    task_id: str | None = None
    calendar_event_id: str | None = None
    title: str | None = Field(None, min_length=1, max_length=500)
    recommendation_reason: str | None = None
    scheduled_date: date | None = None
    completed: bool | None = None
    order_index: int | None = None


class PlanItemResponse(BaseModel):
    id: str
    plan_id: str
    task_id: str | None
    calendar_event_id: str | None
    title: str
    recommendation_reason: str | None
    scheduled_date: date
    completed: bool
    order_index: int

    model_config = {"from_attributes": True}


class StudyPlanCreate(BaseModel):
    workspace_id: str
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = Field(None, max_length=2000)
    items: list[PlanItemCreate] = []


class StudyPlanUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None


class StudyPlanResponse(BaseModel):
    id: str
    workspace_id: str
    title: str
    description: str | None
    items: list[PlanItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
