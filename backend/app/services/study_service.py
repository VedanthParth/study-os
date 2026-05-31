from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.study_session import StudySession
from app.repositories.study_repository import StudyRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.study_session import (
    SessionBlockCreate,
    StudySessionCreate,
    StudySessionPause,
    StudySessionResponse,
    StudySessionStop,
)


class StudyService:
    def __init__(self, db: Session) -> None:
        self.repo = StudyRepository(db)
        self.workspace_repo = WorkspaceRepository(db)
        self.task_repo = TaskRepository(db)

    def _require_workspace(self, workspace_id: str) -> None:
        if not self.workspace_repo.get_by_id(workspace_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    def _require_session(self, session_id: str) -> StudySession:
        session = self.repo.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        return session

    def _require_active_session(self, session_id: str) -> StudySession:
        session = self._require_session(session_id)
        if session.ended_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Session already ended"
            )
        return session

    def _validate_blocks(self, blocks: list[SessionBlockCreate]) -> None:
        indices = sorted(b.order_index for b in blocks)
        if indices != list(range(len(blocks))):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Block order_index must be a contiguous sequence starting at 0",
            )
        if not any(b.block_type == "study" for b in blocks):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="At least one study block is required",
            )

    def _validate_task_workspace(self, task_id: str, workspace_id: str) -> None:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        if task.workspace_id != workspace_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task does not belong to this workspace",
            )

    def start_session(self, payload: StudySessionCreate) -> StudySessionResponse:
        self._require_workspace(payload.workspace_id)
        if payload.task_id:
            self._validate_task_workspace(payload.task_id, payload.workspace_id)
        self._validate_blocks(payload.blocks)
        planned = sum(b.duration_minutes * 60 for b in payload.blocks)
        session = self.repo.create(payload, planned, datetime.now(UTC))
        return StudySessionResponse.model_validate(session)

    def pause_session(self, session_id: str, payload: StudySessionPause) -> StudySessionResponse:
        session = self._require_active_session(session_id)
        updated = self.repo.pause(session, session.pause_count + 1, payload.actual_duration)
        return StudySessionResponse.model_validate(updated)

    def resume_session(self, session_id: str) -> StudySessionResponse:
        session = self._require_active_session(session_id)
        return StudySessionResponse.model_validate(session)

    def stop_session(self, session_id: str, payload: StudySessionStop) -> StudySessionResponse:
        session = self._require_active_session(session_id)
        updated = self.repo.stop(session, payload.actual_duration, payload.completed)
        return StudySessionResponse.model_validate(updated)

    def list_sessions(self, workspace_id: str) -> list[StudySessionResponse]:
        self._require_workspace(workspace_id)
        return [
            StudySessionResponse.model_validate(s)
            for s in self.repo.list_by_workspace(workspace_id)
        ]
