from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
assert config.config_file_name is not None
fileConfig(config.config_file_name)

# add your model's MetaData object here
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app.db.base import Base
from app.core.config import settings

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def run_migrations_offline():
    url = str(settings.DATABASE.DATABASE_URL)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    # get_section may return None if the config section is missing, so fall back to an empty dict
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = str(settings.DATABASE.DATABASE_URL)

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
