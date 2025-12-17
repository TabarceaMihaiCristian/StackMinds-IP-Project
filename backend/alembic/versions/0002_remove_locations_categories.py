"""remove locations and categories tables, add location/category strings

Revision ID: 0002_remove_locations_categories
Revises: 0001_initial
Create Date: 2025-12-17 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_remove_locations_categories'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add new string columns for location and category
    op.add_column('events', sa.Column('location', sa.String(length=100), nullable=True))
    op.add_column('events', sa.Column('category', sa.String(length=100), nullable=True))

    # Populate new columns from existing tables if present
    conn = op.get_bind()
    # Update location names from locations table
    try:
        conn.execute(sa.text("""
            UPDATE events
            SET location = l.name
            FROM locations l
            WHERE events.location_id = l.id;
        """))
    except Exception:
        # If locations table doesn't exist or update fails, ignore
        pass

    # Update category names from categories table
    try:
        conn.execute(sa.text("""
            UPDATE events
            SET category = c.name
            FROM categories c
            WHERE events.category_id = c.id;
        """))
    except Exception:
        pass

    # Drop old columns
    with op.batch_alter_table('events') as batch_op:
        try:
            batch_op.drop_column('location_id')
        except Exception:
            pass
        try:
            batch_op.drop_column('category_id')
        except Exception:
            pass

    # drop categories and locations
    try:
        op.drop_table('categories')
    except Exception:
        pass
    try:
        op.drop_table('locations')
    except Exception:
        pass


def downgrade():
    # Recreate locations and categories tables (empty)
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
    # Add back _id columns on events
    with op.batch_alter_table('events') as batch_op:
        batch_op.add_column(sa.Column('location_id', sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column('category_id', sa.String(length=36), nullable=True))

    # Note: data in location/category string columns is not migrated back into newly created id tables.