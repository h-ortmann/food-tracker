"""create meal table

Revision ID: e3a4f5b6c7d8
Revises:
Create Date: 2026-06-06 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e3a4f5b6c7d8'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'meal',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('meal')
