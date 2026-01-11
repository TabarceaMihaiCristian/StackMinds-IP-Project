from datetime import UTC, datetime
from typing import cast

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Event
from app.schemas import EventCreate, EventUpdate


def get_event(db: Session, event_id: str) -> Event | None:
    return db.get(Event, event_id)


def get_events(
    db: Session, skip: int = 0, limit: int = 100, upcoming_only: bool = False
) -> list[Event]:
    query = select(Event)
    if upcoming_only:
        now = datetime.now(UTC)
        query = query.where(Event.start_at >= now)
    query = query.offset(skip).limit(limit)

    result = db.execute(query).scalars().all()
    return cast(list[Event], result)


def create_event(db: Session, event_id: EventCreate, organizer_id: str) -> Event:
    event = Event(
        title=event_id.title,
        description=event_id.description,
        start_at=event_id.start_at,
        end_at=event_id.end_at,
        location=event_id.location,
        category=event_id.category,
        max_participants=event_id.max_participants or 0,
        status=event_id.status,
        organizer_id=organizer_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event: Event, event_in: EventUpdate) -> Event:
    for field, value in event_in.model_dump(exclude_unset=True).items():
        # coerce explicit null for max_participants to 0 to satisfy DB constraint
        if field == "max_participants" and value is None:
            value = 0
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()
