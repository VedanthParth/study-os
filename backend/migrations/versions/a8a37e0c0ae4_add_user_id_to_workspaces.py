"""add_user_id_to_workspaces

Revision ID: a8a37e0c0ae4
Revises: fdc1e11ded51
Create Date: 2026-05-31 16:06:36.761485

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = 'a8a37e0c0ae4'
down_revision: str | Sequence[str] | None = 'fdc1e11ded51'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('workspaces', sa.Column('user_id', sa.String(length=36), nullable=True))
    op.create_index('ix_workspaces_user_id', 'workspaces', ['user_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_workspaces_user_id', table_name='workspaces')
    op.drop_column('workspaces', 'user_id')
