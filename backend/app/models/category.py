from sqlalchemy import Column, String, String, Text
import uuid
from app.db.base import Base

class EventCategory(Base):
    __tablename__ = "categories"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)