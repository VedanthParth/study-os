"""create_workspace_views

Revision ID: 90bb5da85bd5
Revises: a8a37e0c0ae4
Create Date: 2026-05-31 17:16:57.897886

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '90bb5da85bd5'
down_revision: str | Sequence[str] | None = 'a8a37e0c0ae4'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'workspace_views',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('visible_widgets', sa.String(length=500), nullable=False),
        sa.Column('layout_type', sa.String(length=30), nullable=False),
        sa.Column('widget_density', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('workspace_id', name='uq_workspace_views_workspace_id'),
    )
    op.create_index('ix_workspace_views_workspace_id', 'workspace_views', ['workspace_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_workspace_views_workspace_id', table_name='workspace_views')
    op.drop_table('workspace_views')
