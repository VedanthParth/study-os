from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.workspace_view import WorkspaceViewResponse, WorkspaceViewUpdate
from app.services.workspace_view_service import WorkspaceViewService

router = APIRouter(prefix="/workspace-views", tags=["workspace-views"])


def _service(db: Session = Depends(get_db)) -> WorkspaceViewService:
    return WorkspaceViewService(db)


@router.get("/{workspace_id}", response_model=WorkspaceViewResponse)
def get_view(
    workspace_id: str,
    service: WorkspaceViewService = Depends(_service),
) -> WorkspaceViewResponse:
    """Get or create the view configuration for a workspace."""
    return service.get_or_create(workspace_id)


@router.put("/{workspace_id}", response_model=WorkspaceViewResponse)
def upsert_view(
    workspace_id: str,
    payload: WorkspaceViewUpdate,
    service: WorkspaceViewService = Depends(_service),
) -> WorkspaceViewResponse:
    """Create or update the view configuration for a workspace."""
    return service.upsert(workspace_id, payload)
