from sqlalchemy import Column, Integer, String, Text
import uuid

from app.db.base import Base

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    room = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    description = Column(Text)