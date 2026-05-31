"""create_study_plans_and_plan_items

Revision ID: fdc1e11ded51
Revises: 4a1921d1f6d6
Create Date: 2026-05-31 15:46:59.535442

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = 'fdc1e11ded51'
down_revision: str | Sequence[str] | None = '4a1921d1f6d6'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'study_plans',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workspace_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_study_plans_workspace_id', 'study_plans', ['workspace_id'])

    op.create_table(
        'plan_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('plan_id', sa.String(length=36), nullable=False),
        sa.Column('task_id', sa.String(length=36), nullable=True),
        sa.Column('calendar_event_id', sa.String(length=36), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('recommendation_reason', sa.String(length=2000), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['plan_id'], ['study_plans.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['calendar_event_id'], ['calendar_events.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_plan_items_plan_id', 'plan_items', ['plan_id'])
    op.create_index('ix_plan_items_task_id', 'plan_items', ['task_id'])
    op.create_index('ix_plan_items_calendar_event_id', 'plan_items', ['calendar_event_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_plan_items_calendar_event_id', table_name='plan_items')
    op.drop_index('ix_plan_items_task_id', table_name='plan_items')
    op.drop_index('ix_plan_items_plan_id', table_name='plan_items')
    op.drop_table('plan_items')
    op.drop_index('ix_study_plans_workspace_id', table_name='study_plans')
    op.drop_table('study_plans')
