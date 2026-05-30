"""create_calendar_events_table

Revision ID: b8bc9e902906
Revises: 72189f836aa3
Create Date: 2026-05-30 20:02:37.992122

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b8bc9e902906'
down_revision: str | Sequence[str] | None = '72189f836aa3'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'calendar_events',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('event_type', sa.String(length=20), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_calendar_events_workspace_id', 'calendar_events', ['workspace_id'])
    op.create_index('ix_calendar_events_task_id', 'calendar_events', ['task_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_calendar_events_task_id', table_name='calendar_events')
    op.drop_index('ix_calendar_events_workspace_id', table_name='calendar_events')
    op.drop_table('calendar_events')
