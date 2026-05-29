from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

WorkspaceType = Literal["semester", "competitive", "research", "self_learning"]


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    type: WorkspaceType


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    type: WorkspaceType | None = None


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    type: WorkspaceType
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
