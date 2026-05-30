"""create_tasks_table

Revision ID: 72189f836aa3
Revises: 2d9eb96da168
Create Date: 2026-05-30 17:01:46.810439

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '72189f836aa3'
down_revision: str | Sequence[str] | None = '2d9eb96da168'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_tasks_workspace_id', 'tasks', ['workspace_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_tasks_workspace_id', table_name='tasks')
    op.drop_table('tasks')
