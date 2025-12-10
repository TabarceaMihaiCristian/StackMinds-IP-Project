from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .location import LocationRead
from .category import CategoryRead

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_at: datetime
    end_at: datetime
    location_id: Optional[str] = None
    category_id: Optional[str] = None
    max_participants: Optional[int] = None
    status: str = "draft"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location_id: Optional[str] = None
    category_id: Optional[str] = None
    max_participants: Optional[int] = None
    status: Optional[str] = None

class EventRead(BaseModel):
    id: str
    organizer_id: str
    
    location: Optional[LocationRead] = None
    category: Optional[CategoryRead] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)