from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db, require_role, get_current_active_user
from app.models import Event, User
from app.repositories import get_event, get_events, create_event, update_event, delete_event
from app.schemas import EventCreate, EventRead, EventUpdate

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=List[EventRead])
def list_events(skip: int = 0, limit: int = Query(100, le=1000), upcoming_only: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    events = get_events(db, skip=skip, limit=limit, upcoming_only=upcoming_only)
    return events

@router.get("/{event_id}", response_model=EventRead)
def get_event_by_id(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    event = get_event(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event

@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_new_event(event_in: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("organizer", "admin"))):
    event = create_event(db, event_in=event_in, organizer_id=str(current_user.id))
    return event

@router.put("/{event_id}", response_model=EventRead)
def update_existing_event(event_id: str, event_in: EventUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role("organizer", "admin"))):
    event = get_event(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if str(event.organizer_id) != str(current_user.id) and str(current_user.role) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this event")
    updated_event = update_event(db, event=event, event_in=event_in)
    return updated_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_event(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("organizer", "admin"))):
    event = get_event(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if str(event.organizer_id) != str(current_user.id) and str(current_user.role) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this event")
    delete_event(db, event=event)
    return None