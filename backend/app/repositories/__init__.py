# app/repositories/__init__.py
from .dashboard import (
    get_admin_dashboard_data,
    get_organizer_dashboard_data,
    get_student_dashboard_data,
    get_upcoming_events,
)
from .event import create_event, delete_event, get_event, get_events, update_event
from .registration import (
    cancel_registration,
    count_event_registrations,
    create_registration,
    get_registration,
    get_registrations_for_event,
    get_registrations_for_user,
    get_registrations_for_user_and_event,
)

__all__ = [
    "get_event",
    "get_events",
    "create_event",
    "update_event",
    "delete_event",
    "get_registration",
    "get_registrations_for_user_and_event",
    "count_event_registrations",
    "create_registration",
    "cancel_registration",
    "get_registrations_for_user",
    "get_registrations_for_event",
    "get_upcoming_events",
    "get_student_dashboard_data",
    "get_organizer_dashboard_data",
    "get_admin_dashboard_data",
]
