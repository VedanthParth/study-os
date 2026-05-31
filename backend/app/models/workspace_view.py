import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.workspace import Workspace

_DEFAULT_WIDGETS = '["calendar","tasks","study","analytics"]'
_DEFAULT_LAYOUT = "overview"
_DEFAULT_DENSITY = "balanced"


class WorkspaceView(Base):
    """Per-workspace dashboard view configuration.

    Stores layout preferences, visible widget list, and density preset so
    each workspace remembers its own dashboard setup independently.
    """

    __tablename__ = "workspace_views"
    __table_args__ = (UniqueConstraint("workspace_id", name="uq_workspace_views_workspace_id"),)

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    workspace_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Stored as JSON array string, e.g. '["calendar","tasks","study"]'
    visible_widgets: Mapped[str] = mapped_column(
        String(500), nullable=False, default=_DEFAULT_WIDGETS
    )
    layout_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default=_DEFAULT_LAYOUT
    )
    widget_density: Mapped[str] = mapped_column(
        String(20), nullable=False, default=_DEFAULT_DENSITY
    )
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

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="view")
