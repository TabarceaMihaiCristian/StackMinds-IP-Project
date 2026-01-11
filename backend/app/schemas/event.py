from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EventBase(BaseModel):
    title: str
    description: str | None = None
    start_at: datetime
    end_at: datetime
    location: str | None = None
    category: str | None = None
    max_participants: int | None = None
    status: str = "draft"


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    location: str | None = None
    category: str | None = None
    max_participants: int | None = None
    status: str | None = None


class EventRead(BaseModel):
    id: str
    organizer_id: str
    organizer_name: str | None = None

    title: str
    description: str | None = None
    start_at: datetime
    end_at: datetime
    status: str

    location: str | None = None
    category: str | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
