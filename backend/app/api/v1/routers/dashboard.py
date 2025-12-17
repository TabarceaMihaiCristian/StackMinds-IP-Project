from typing import List, cast, Sequence
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.engine.row import Row

from app.api.v1.dependencies import (
    get_db,
    require_role,
)
from app.models import User, Event
from app.repositories.dashboard import (
    get_student_dashboard_data,
    get_organizer_dashboard_data,
    get_admin_dashboard_data,
)
from app.schemas import (
    DashboardEventSummary,
    StudentDashboard,
    OrganizerDashboard,
    AdminDashboard,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _rows_to_event_summaries(rows: Sequence[Event] | Sequence[Row]) -> List[DashboardEventSummary]:
    summaries: list[DashboardEventSummary] = []
    for row in rows:
        
        if isinstance(row, tuple):
            event: Event = row[0]
            category_name = row[1] if len(row) > 1 else None
            location_name = row[2] if len(row) > 2 else None

        elif hasattr(row, "_mapping") and len(row._mapping) == 1:
            event = cast(Event, next(iter(row._mapping.values())))
            category_name = getattr(event, "category", None)
            location_name = getattr(event, "location", None)
        
        else:
            event = row
            category_name = getattr(event, "category", None)
            location_name = getattr(event, "location", None)

        summaries.append(
            DashboardEventSummary(
                id=str(event.id),
                title=cast(str, event.title),
                start_at=cast(datetime, event.start_at),
                end_at=cast(datetime, event.end_at),
                status=cast(str, event.status),
                category_name=category_name,
                location_name=location_name,
            )
        )

    return summaries


@router.get("/student", response_model=StudentDashboard)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    total_regs, upcoming_count, rows = get_student_dashboard_data(
        db, student_id=cast(str, current_user.id)
    )
    events = _rows_to_event_summaries(rows)
    return StudentDashboard(
        upcoming_events_count=upcoming_count,
        my_registrations_count=total_regs,
        my_upcoming_events=events,
    )


@router.get("/organizer", response_model=OrganizerDashboard)
def get_organizer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer")),
):
    total_events, upcoming_events_count, total_regs, rows = (
        get_organizer_dashboard_data(db, organizer_id=cast(str, current_user.id))
    )
    events = _rows_to_event_summaries(rows)
    return OrganizerDashboard(
        my_events_count=total_events,
        my_upcoming_events_count=upcoming_events_count,
        total_registrations_for_my_events=total_regs,
        upcoming_events=events,
    )


@router.get("/admin", response_model=AdminDashboard)
def get_admin_dashboard(
    db: Session = Depends(get_db),
):
    (
        total_users,
        total_events,
        total_regs,
        upcoming_events_count,
        rows,
    ) = get_admin_dashboard_data(db)
    events = _rows_to_event_summaries(rows)
    return AdminDashboard(
        total_users=total_users,
        total_events=total_events,
        total_registrations=total_regs,
        upcoming_events_count=upcoming_events_count,
        upcoming_events=events,
    )