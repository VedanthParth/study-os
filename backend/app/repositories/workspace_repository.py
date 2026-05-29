from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Workspace]:
        return (
            self.db.query(Workspace).order_by(Workspace.created_at.desc()).all()
        )

    def get_by_id(self, workspace_id: str) -> Workspace | None:
        return (
            self.db.query(Workspace).filter(Workspace.id == workspace_id).first()
        )

    def create(self, payload: WorkspaceCreate) -> Workspace:
        workspace = Workspace(**payload.model_dump())
        self.db.add(workspace)
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def update(self, workspace: Workspace, payload: WorkspaceUpdate) -> Workspace:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(workspace, field, value)
        workspace.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def delete(self, workspace: Workspace) -> None:
        self.db.delete(workspace)
        self.db.commit()
