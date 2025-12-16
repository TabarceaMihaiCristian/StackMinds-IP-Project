"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2025-12-12 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'locations',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('room', sa.String(length=100), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
    )

    op.create_table(
        'categories',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
    )
    op.create_unique_constraint(None, 'categories', ['name'])

    op.create_table(
        'events',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_at', sa.DateTime(), nullable=False),
        sa.Column('end_at', sa.DateTime(), nullable=False),
        sa.Column('location_id', sa.String(length=36), nullable=False),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('organizer_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('max_participants', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

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
    op.drop_table('events')
    op.drop_table('categories')
    op.drop_table('locations')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
