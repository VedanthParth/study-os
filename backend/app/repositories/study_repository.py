from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.study_session import SessionBlock, StudySession
from app.schemas.study_session import SessionBlockCreate, StudySessionCreate


class StudyRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_workspace(self, workspace_id: str) -> list[StudySession]:
        return (
            self.db.query(StudySession)
            .filter(StudySession.workspace_id == workspace_id)
            .order_by(StudySession.started_at.desc())
            .all()
        )

    def get_by_id(self, session_id: str) -> StudySession | None:
        return self.db.query(StudySession).filter(StudySession.id == session_id).first()

    def create(
        self,
        payload: StudySessionCreate,
        planned_duration: int,
        started_at: datetime,
    ) -> StudySession:
        session = StudySession(
            workspace_id=payload.workspace_id,
            task_id=payload.task_id,
            method=payload.method,
            planned_duration=planned_duration,
            started_at=started_at,
        )
        self.db.add(session)
        self.db.flush()  # obtain session.id before creating blocks
        self._create_blocks(session.id, payload.blocks)
        self.db.commit()
        self.db.refresh(session)
        return session

    def _create_blocks(self, session_id: str, blocks: list[SessionBlockCreate]) -> None:
        for b in blocks:
            self.db.add(
                SessionBlock(
                    session_id=session_id,
                    block_type=b.block_type,
                    duration_minutes=b.duration_minutes,
                    order_index=b.order_index,
                )
            )

    def pause(self, session: StudySession, pause_count: int, actual_duration: int) -> StudySession:
        session.pause_count = pause_count
        session.actual_duration = actual_duration
        session.updated_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(session)
        return session

    def stop(
        self,
        session: StudySession,
        actual_duration: int,
        completed: bool,
    ) -> StudySession:
        session.ended_at = datetime.now(UTC)
        session.actual_duration = actual_duration
        session.completed = completed
        session.interrupted = not completed
        session.updated_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(session)
        return session
