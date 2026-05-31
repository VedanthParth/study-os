from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

StudyMethod = Literal["pomodoro", "deep-work", "revision", "recall", "custom"]
BlockType = Literal["study", "short-break", "long-break"]


class SessionBlockCreate(BaseModel):
    block_type: BlockType
    duration_minutes: int = Field(..., ge=1, le=480)
    order_index: int = Field(..., ge=0)


class StudySessionCreate(BaseModel):
    workspace_id: str
    task_id: str | None = None
    method: StudyMethod
    blocks: list[SessionBlockCreate] = Field(..., min_length=1)


class StudySessionPause(BaseModel):
    actual_duration: int = Field(..., ge=0)


class StudySessionStop(BaseModel):
    actual_duration: int = Field(..., ge=0)
    completed: bool = False


class StudySessionUpdate(BaseModel):
    actual_duration: int | None = None
    completed: bool | None = None
    interrupted: bool | None = None
    ended_at: datetime | None = None


class SessionBlockResponse(BaseModel):
    id: str
    session_id: str
    block_type: BlockType
    duration_minutes: int
    order_index: int

    model_config = {"from_attributes": True}


class StudySessionResponse(BaseModel):
    id: str
    workspace_id: str
    task_id: str | None
    method: StudyMethod
    planned_duration: int
    actual_duration: int
    started_at: datetime
    ended_at: datetime | None
    completed: bool
    interrupted: bool
    pause_count: int
    blocks: list[SessionBlockResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
