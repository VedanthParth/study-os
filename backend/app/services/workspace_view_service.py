from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.workspace_view_repository import WorkspaceViewRepository
from app.schemas.workspace_view import WorkspaceViewResponse, WorkspaceViewUpdate


class WorkspaceViewService:
    def __init__(self, db: Session) -> None:
        self.repo = WorkspaceViewRepository(db)
        self.workspace_repo = WorkspaceRepository(db)

    def _require_workspace(self, workspace_id: str) -> None:
        if not self.workspace_repo.get_by_id(workspace_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found"
            )

    def get_or_create(self, workspace_id: str) -> WorkspaceViewResponse:
        self._require_workspace(workspace_id)
        view = self.repo.get_or_create(workspace_id)
        return WorkspaceViewResponse.model_validate(view)

    def upsert(self, workspace_id: str, payload: WorkspaceViewUpdate) -> WorkspaceViewResponse:
        self._require_workspace(workspace_id)
        view = self.repo.upsert(
            workspace_id=workspace_id,
            layout_type=payload.layout_type,
            visible_widgets=payload.visible_widgets,
            widget_density=payload.widget_density,
        )
        return WorkspaceViewResponse.model_validate(view)
