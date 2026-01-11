from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DashboardEventSummary(BaseModel):
    id: str
    title: str
    start_at: datetime
    end_at: datetime
    status: str
    category_name: str | None = None
    location_name: str | None = None
    organizer_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class StudentDashboard(BaseModel):
    upcoming_events_count: int
    my_registrations_count: int
    my_upcoming_events: list[DashboardEventSummary]


class OrganizerDashboard(BaseModel):
    my_events_count: int
    my_upcoming_events_count: int
    total_registrations_for_my_events: int
    upcoming_events: list[DashboardEventSummary]


class AdminDashboard(BaseModel):
    total_users: int
    total_events: int
    total_registrations: int
    upcoming_events_count: int
    upcoming_events: list[DashboardEventSummary]
