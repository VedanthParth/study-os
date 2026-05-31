from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate


class WorkspaceService:
    def __init__(self, db: Session) -> None:
        self.repo = WorkspaceRepository(db)

    def _require_workspace(self, workspace_id: str):  # noqa: ANN201
        workspace = self.repo.get_by_id(workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        return workspace

    def list_workspaces(self, user_id: str) -> list[WorkspaceResponse]:
        return [WorkspaceResponse.model_validate(w) for w in self.repo.list_by_user(user_id)]

    def get_workspace(self, workspace_id: str) -> WorkspaceResponse:
        return WorkspaceResponse.model_validate(self._require_workspace(workspace_id))

    def create_workspace(self, payload: WorkspaceCreate) -> WorkspaceResponse:
        workspace = self.repo.create(payload)
        return WorkspaceResponse.model_validate(workspace)

    def update_workspace(self, workspace_id: str, payload: WorkspaceUpdate) -> WorkspaceResponse:
        workspace = self._require_workspace(workspace_id)
        updated = self.repo.update(workspace, payload)
        return WorkspaceResponse.model_validate(updated)

    def delete_workspace(self, workspace_id: str) -> None:
        self.repo.delete(self._require_workspace(workspace_id))
