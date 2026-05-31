"""create_study_sessions_and_session_blocks

Revision ID: 4a1921d1f6d6
Revises: b8bc9e902906
Create Date: 2026-05-31 13:08:49.928580

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '4a1921d1f6d6'
down_revision: str | Sequence[str] | None = 'b8bc9e902906'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'study_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('method', sa.String(length=30), nullable=False),
        sa.Column('planned_duration', sa.Integer(), nullable=False),
        sa.Column('actual_duration', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('interrupted', sa.Boolean(), nullable=False),
        sa.Column('pause_count', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_study_sessions_workspace_id', 'study_sessions', ['workspace_id'])
    op.create_index('ix_study_sessions_task_id', 'study_sessions', ['task_id'])
    op.create_table(
        'session_blocks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('session_id', sa.String(length=36), nullable=False),
        sa.Column('block_type', sa.String(length=20), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_session_blocks_session_id', 'session_blocks', ['session_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_session_blocks_session_id', table_name='session_blocks')
    op.drop_table('session_blocks')
    op.drop_index('ix_study_sessions_task_id', table_name='study_sessions')
    op.drop_index('ix_study_sessions_workspace_id', table_name='study_sessions')
    op.drop_table('study_sessions')
