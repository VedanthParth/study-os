import json
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.workspace_view import (
    _DEFAULT_DENSITY,
    _DEFAULT_LAYOUT,
    _DEFAULT_WIDGETS,
    WorkspaceView,
)


class WorkspaceViewRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_workspace(self, workspace_id: str) -> WorkspaceView | None:
        return (
            self.db.query(WorkspaceView)
            .filter(WorkspaceView.workspace_id == workspace_id)
            .first()
        )

    def get_or_create(self, workspace_id: str) -> WorkspaceView:
        existing = self.get_by_workspace(workspace_id)
        if existing:
            return existing
        view = WorkspaceView(
            workspace_id=workspace_id,
            visible_widgets=_DEFAULT_WIDGETS,
            layout_type=_DEFAULT_LAYOUT,
            widget_density=_DEFAULT_DENSITY,
        )
        self.db.add(view)
        self.db.commit()
        self.db.refresh(view)
        return view

    def upsert(
        self,
        workspace_id: str,
        layout_type: str | None,
        visible_widgets: list[str] | None,
        widget_density: str | None,
    ) -> WorkspaceView:
        view = self.get_or_create(workspace_id)
        if layout_type is not None:
            view.layout_type = layout_type
        if visible_widgets is not None:
            view.visible_widgets = json.dumps(visible_widgets)
        if widget_density is not None:
            view.widget_density = widget_density
        view.updated_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(view)
        return view
