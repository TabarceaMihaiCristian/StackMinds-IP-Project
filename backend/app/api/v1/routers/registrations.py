from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db, get_current_active_user, require_role

from app.models import User, Event

from app.repositories import (
    get_event,
    get_registrations_for_user_and_event,
    count_event_registrations,
    create_registration,
    cancel_registration,
    get_registrations_for_user,
    get_registrations_for_event,
)

from app.schemas import RegistrationRead

router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.post("/events/{event_id}/register", response_model=RegistrationRead, status_code=status.HTTP_201_CREATED)

def register_for_event(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("student", "admin", "organizer"))):
    event = get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    existing_registration = get_registrations_for_user_and_event(db, current_user.id, event_id) #type: ignore
    if existing_registration and existing_registration.status == "registered": #type: ignore
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already registered for this event")
    
    if event.max_participants is not None:
        current_count = count_event_registrations(db, event_id)
        if current_count >= event.max_participants: #type: ignore
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Event is full")

    registration = create_registration(db, user_id=current_user.id, event=event) #type: ignore
    
    return registration

@router.delete("/events/{event_id}/register", response_model=RegistrationRead, status_code=status.HTTP_200_OK)

def unregister_from_event(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    event = get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    registration = get_registrations_for_user_and_event(db, current_user.id, event_id) #type: ignore

    if not registration or registration.status != "registered": #type: ignore
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    canceled_registration = cancel_registration(db, registration)
    
    return canceled_registration

@router.get("/me/registrations", response_model=List[RegistrationRead], status_code=status.HTTP_200_OK)
def list_my_registrations(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    registrations = get_registrations_for_user(db, current_user.id) #type: ignore
    return registrations

@router.get("/events/{event_id}/registrations", response_model=List[RegistrationRead], status_code=status.HTTP_200_OK)
def list_registrations_for_event(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("organizer", "admin"))):
    event = get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    if current_user.role == "organizer" and event.organizer_id != current_user.id: #type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view registrations for this event",
        )

    registrations = get_registrations_for_event(db, event_id)
    return registrations