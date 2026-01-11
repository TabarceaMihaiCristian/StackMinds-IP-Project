import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text)

    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)

    location = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)

    organizer_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    status = Column(String(50), nullable=False, default="draft")
    max_participants = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC), nullable=False
    )

    organizer = relationship("User", back_populates="organized_events")
    registrations = relationship("Registration", back_populates="event")

    @property
    def organizer_name(self) -> str | None:
        if self.organizer:
            return self.organizer.name
        return None
