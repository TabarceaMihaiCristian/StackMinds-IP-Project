from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session, aliased

from app.models import Event, Registration, User


def get_upcoming_events(db: Session, limit: int = 5) -> Sequence[Event]:
    now = datetime.now(timezone.utc)
    stmt = (
        select(Event)
        .where(Event.start_at >= now, Event.status == "published")
        .order_by(Event.start_at.asc())
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


def get_student_dashboard_data(db: Session, student_id: str):
    now = datetime.now(timezone.utc)

    total_regs_stmt = select(func.count(Registration.id)).where(
        Registration.user_id == student_id,
        Registration.status == "registered",
    )
    total_regs = int(db.execute(total_regs_stmt).scalar_one())

    upcoming_count_stmt = (
        select(func.count(Event.id))
        .join(Registration, Registration.event_id == Event.id)
        .where(
            Registration.user_id == student_id,
            Registration.status == "registered",
            Event.start_at >= now,
            Event.status == "published",
        )
    )
    upcoming_count = int(db.execute(upcoming_count_stmt).scalar_one())

    upcoming_events_stmt = (
        select(Event)
        .join(Registration, Registration.event_id == Event.id)
        .where(
            Registration.user_id == student_id,
            Registration.status == "registered",
            Event.start_at >= now,
            Event.status == "published",
        )
        .order_by(Event.start_at.asc())
        .limit(5)
    )

    rows = db.execute(upcoming_events_stmt).all()

    return total_regs, upcoming_count, rows


def get_organizer_dashboard_data(db: Session, organizer_id: str):
    now = datetime.now(timezone.utc)

    total_events_stmt = select(func.count(Event.id)).where(
        Event.organizer_id == organizer_id
    )
    total_events = int(db.execute(total_events_stmt).scalar_one())

    upcoming_events_count_stmt = select(func.count(Event.id)).where(
        Event.organizer_id == organizer_id,
        Event.start_at >= now,
        Event.status == "published",
    )
    upcoming_events_count = int(
        db.execute(upcoming_events_count_stmt).scalar_one()
    )

    total_regs_stmt = (
        select(func.count(Registration.id))
        .join(Event, Registration.event_id == Event.id)
        .where(Event.organizer_id == organizer_id)
    )
    total_regs = int(db.execute(total_regs_stmt).scalar_one())


    upcoming_events_stmt = (
        select(Event)
        .where(
            Event.organizer_id == organizer_id,
            Event.start_at >= now,
            Event.status == "published",
        )
        .order_by(Event.start_at.asc())
        .limit(5)
    )
    rows = db.execute(upcoming_events_stmt).all()

    return total_events, upcoming_events_count, total_regs, rows


def get_admin_dashboard_data(db: Session):
    now = datetime.now(timezone.utc)

    total_users = int(db.execute(select(func.count(User.id))).scalar_one())
    total_events = int(db.execute(select(func.count(Event.id))).scalar_one())
    total_regs = int(
        db.execute(select(func.count(Registration.id))).scalar_one()
    )

    upcoming_events_count = int(
        db.execute(
            select(func.count(Event.id)).where(
                Event.start_at >= now, Event.status == "published"
            )
        ).scalar_one()
    )

    upcoming_events_stmt = (
        select(Event)
        .where(Event.start_at >= now, Event.status == "published")
        .order_by(Event.start_at.asc())
        .limit(5)
    )

    rows = db.execute(upcoming_events_stmt).all()

    return total_users, total_events, total_regs, upcoming_events_count, rows