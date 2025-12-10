from typing import Optional, List, Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models import Registration, Event
from app.schemas import RegistrationCreate

def get_registration(db: Session, registration_id: str) -> Optional[Registration]:
    return db.get(Registration, registration_id)

def get_registrations_for_user_and_event(db: Session, user_id: str, event_id: str) -> Optional[Registration]:
    stmt = select(Registration).where(
        Registration.user_id == user_id,
        Registration.event_id == event_id
    )
    return db.execute(stmt).scalars().first()

def count_event_registrations(db: Session, event_id: str) -> int:
    stmt = select(func.count(Registration.id)).where(Registration.event_id == event_id, Registration.status == "registered")
    return db.execute(stmt).scalar_one()

def create_registration(db: Session, user_id: str, event: Event) -> Registration:
    registration = Registration(
        user_id=user_id,
        event_id=event.id,
        status="registered"
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

def cancel_registration(db: Session, registration: Registration) -> Registration:
    registration.status = "canceled" #type: ignore
    db.commit()
    db.refresh(registration)
    return registration

def get_registrations_for_user(db: Session, user_id: str) -> Sequence[Registration]:
    stmt = select(Registration).where(Registration.user_id == user_id)
    return db.execute(stmt).scalars().all()

def get_registrations_for_event(db: Session, event_id: str) -> Sequence[Registration]:
    stmt = select(Registration).where(Registration.event_id == event_id)
    return db.execute(stmt).scalars().all()
