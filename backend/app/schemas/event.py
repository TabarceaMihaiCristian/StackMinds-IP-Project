from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_at: datetime
    end_at: datetime
    location: Optional[str] = None
    category: Optional[str] = None
    max_participants: Optional[int] = None
    status: str = "draft"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    max_participants: Optional[int] = None
    status: Optional[str] = None

class EventRead(BaseModel):
    id: str
    organizer_id: str
    organizer_name: Optional[str] = None

    title: str
    description: Optional[str] = None
    start_at: datetime
    end_at: datetime
    status: str
    
    location: Optional[str] = None
    category: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)