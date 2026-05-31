import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.calendar_event import CalendarEvent
    from app.models.study_plan import StudyPlan
    from app.models.study_session import StudySession
    from app.models.task import Task
    from app.models.user import User
    from app.models.workspace_view import WorkspaceView


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    user: Mapped["User | None"] = relationship("User", back_populates="workspaces")
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="workspace", cascade="all, delete-orphan"
    )
    calendar_events: Mapped[list["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="workspace", cascade="all, delete-orphan"
    )
    study_sessions: Mapped[list["StudySession"]] = relationship(
        "StudySession", back_populates="workspace", cascade="all, delete-orphan"
    )
    study_plans: Mapped[list["StudyPlan"]] = relationship(
        "StudyPlan", back_populates="workspace", cascade="all, delete-orphan"
    )
    view: Mapped["WorkspaceView | None"] = relationship(
        "WorkspaceView", back_populates="workspace", uselist=False, cascade="all, delete-orphan"
    )
