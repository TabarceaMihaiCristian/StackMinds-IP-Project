from typing import Optional, Sequence

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Location
from app.schemas import LocationCreate, LocationUpdate

def get_location(db: Session, location_id: str) -> Optional[Location]:
    return db.get(Location, location_id)

def get_locations(db: Session, skip: int = 0, limit: int = 100) -> Sequence[Location]:
    stmt = select(Location).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_location(db: Session, location_in: LocationCreate) -> Location:
    location = Location(**location_in.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location

def update_location(db: Session, location: Location, location_in: LocationUpdate) -> Location:
    data = location_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(location, field, value)
    db.commit()
    db.refresh(location)
    return location

def delete_location(db: Session, location: Location) -> Location:
    db.delete(location)
    db.commit()
    return location