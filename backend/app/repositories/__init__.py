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

from .location import (
    get_location,
    get_locations,
    create_location,
    update_location,
    delete_location,
)

from .category import (
    get_category,
    get_categories,
    create_category,
    update_category,
    delete_category,
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

    "get_location",
    "get_locations",
    "create_location",
    "update_location",
    "delete_location",

    "get_category",
    "get_categories",
    "create_category",
    "update_category",
    "delete_category",
]
