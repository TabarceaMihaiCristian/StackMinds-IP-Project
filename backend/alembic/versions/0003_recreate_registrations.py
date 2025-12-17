"""recreate registrations table

Revision ID: 0003_recreate_registrations
Revises: 0002_remove_locations_categories
Create Date: 2025-12-17 00:10:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_recreate_registrations'
down_revision = '0002_remove_locations_categories'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'registrations',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('event_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('registered_at', sa.DateTime(), nullable=False),
        sa.Column('checkin_at', sa.DateTime(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
    )


def downgrade():
    op.drop_table('registrations')
