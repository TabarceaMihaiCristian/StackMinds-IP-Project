# app/repositories/__init__.py
from .event import (
    get_event,
    get_events,
    create_event,
    update_event,
    delete_event,
)
from .registration import (
    get_registration,
    get_registrations_for_user_and_event,
    count_event_registrations,
    create_registration,
    cancel_registration,
    get_registrations_for_user,
    get_registrations_for_event,
)


from .dashboard import (
    get_upcoming_events,
    get_student_dashboard_data,
    get_organizer_dashboard_data,
    get_admin_dashboard_data,
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
