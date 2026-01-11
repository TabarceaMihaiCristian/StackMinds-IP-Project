import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)

    status = Column(String(50), nullable=False, default="registered")
    registered_at = Column(DateTime, default=datetime.now(UTC), nullable=False)
    checkin_at = Column(DateTime, nullable=True)
    feedback = Column(Text, nullable=True)

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
