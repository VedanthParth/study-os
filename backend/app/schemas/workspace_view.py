import json
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator

LayoutType = Literal["overview", "planning", "focus", "custom"]
WidgetDensity = Literal["compact", "balanced", "expanded"]

_DEFAULT_WIDGETS = ["calendar", "tasks", "study", "analytics"]


class WorkspaceViewUpdate(BaseModel):
    layout_type: LayoutType | None = None
    visible_widgets: list[str] | None = None
    widget_density: WidgetDensity | None = None


class WorkspaceViewResponse(BaseModel):
    workspace_id: str
    layout_type: LayoutType
    visible_widgets: list[str]
    widget_density: WidgetDensity
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("visible_widgets", mode="before")
    @classmethod
    def deserialize_widgets(cls, v: object) -> list[str]:
        if isinstance(v, str):
            return json.loads(v)
        return list(v)  # type: ignore[arg-type]
