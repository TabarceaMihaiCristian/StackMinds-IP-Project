from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db, get_current_active_user, require_role

from app.models import User

from app.repositories import (
    get_locations,
    get_location,
    create_location,
    update_location,
    delete_location,
)

from app.schemas import LocationRead, LocationCreate, LocationUpdate

router = APIRouter(prefix="/locations", tags=["locations"])

@router.post("/", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
def list_locations(skip: int = 0, limit: int = Query(10, le=100), db: Session = Depends(get_db)):
    location = get_locations(db, skip=skip, limit=limit)
    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return location

@router.get("/{location_id}", response_model=LocationRead, status_code=status.HTTP_200_OK)
def get_location_by_id(location_id: str, db: Session = Depends(get_db)):
    location = get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return location

@router.post("/", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
def create_new_location(location_in: LocationCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    location = create_location(db, location_in)
    return location

@router.put("/{location_id}", response_model=LocationRead, status_code=status.HTTP_200_OK)
def update_existing_location(location_id: str, location_in: LocationUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    location = get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    location = update_location(db, location, location_in)
    return location

@router.delete("/{location_id}", response_model=LocationRead, status_code=status.HTTP_200_OK)
def delete_existing_location(location_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    location = get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    location = delete_location(db, location)
    return location
