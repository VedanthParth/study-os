from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


def _service(db: Session = Depends(get_db)) -> WorkspaceService:
    return WorkspaceService(db)


@router.get("", response_model=list[WorkspaceResponse])
def list_workspaces(
    user_id: str = Query(...),
    service: WorkspaceService = Depends(_service),
) -> list[WorkspaceResponse]:
    return service.list_workspaces(user_id)


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    payload: WorkspaceCreate,
    service: WorkspaceService = Depends(_service),
) -> WorkspaceResponse:
    return service.create_workspace(payload)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: str,
    payload: WorkspaceUpdate,
    service: WorkspaceService = Depends(_service),
) -> WorkspaceResponse:
    return service.update_workspace(workspace_id, payload)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: str,
    service: WorkspaceService = Depends(_service),
) -> None:
    service.delete_workspace(workspace_id)
