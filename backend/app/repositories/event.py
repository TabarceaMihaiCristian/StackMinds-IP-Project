from datetime import datetime, timezone
from typing import Optional, List, cast

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Event
from app.schemas import EventCreate, EventUpdate

def get_event(db: Session, event_id: str) -> Optional[Event]:
    return db.get(Event, event_id)

def get_events(db: Session, skip: int = 0, limit: int = 100, upcoming_only: bool = False) -> List[Event]:
    query = select(Event)
    if upcoming_only:
        now = datetime.now(timezone.utc)
        query = query.where(Event.start_at >= now)
    query = query.offset(skip).limit(limit)

    result = db.execute(query).scalars().all()
    return cast(List[Event], result)

def create_event(db: Session, event_in: EventCreate, organizer_id: str) -> Event:
    event = Event(title=event_in.title,
                  description=event_in.description,
                  start_at=event_in.start_at,
                  end_at=event_in.end_at,
                  location_id=event_in.location_id,
                  category_id=event_in.category_id,
                  max_participants=event_in.max_participants,
                  status=event_in.status,
                  organizer_id=organizer_id
                )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def update_event(db: Session, event: Event, event_in: EventUpdate) -> Event:
    for field, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event

def delete_event(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()