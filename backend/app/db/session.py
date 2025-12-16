from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

database_url = str(settings.DATABASE.DATABASE_URL)
connect_args = {}
if database_url.startswith("sqlite"):
    # sqlite needs this for using the same connection in different threads
    connect_args = {"check_same_thread": False}

engine = create_engine(database_url, future=True, echo=settings.APP_ENV == "dev", connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)