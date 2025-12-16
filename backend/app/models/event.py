from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class Event(Base):
    __tablename__ = "events"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text)

    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)

    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    organizer_id = Column(String(36), ForeignKey("users.id"), nullable=False)   

    status = Column(String(50), nullable=False, default="draft")
    max_participants = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False) 
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    location = relationship("Location")
    category = relationship("EventCategory")
    organizer = relationship("User", back_populates="organized_events")
    registrations = relationship("Registration", back_populates="event")
    