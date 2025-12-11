from typing import List, cast

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.dependencies import (
    get_db,
    get_current_active_user,
    require_role,
)
from app.models import User
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


def _rows_to_event_summaries(rows) -> List[DashboardEventSummary]:
    items: list[DashboardEventSummary] = []
    for event, category_name, location_name in rows:
        items.append(
            DashboardEventSummary(
                id=event.id,
                title=event.title,
                start_at=event.start_at,
                end_at=event.end_at,
                status=event.status,
                category_name=category_name,
                location_name=location_name,
            )
        )
    return items


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
    current_user: User = Depends(require_role("admin")),
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