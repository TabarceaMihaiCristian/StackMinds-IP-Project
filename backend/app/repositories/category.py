from typing import Optional, Sequence

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import EventCategory
from app.schemas import CategoryCreate, CategoryUpdate


def get_category(db: Session, category_id: str) -> Optional[EventCategory]:
    return db.get(EventCategory, category_id)

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> Sequence[EventCategory]:
    stmt = select(EventCategory).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_category(db: Session, category_in: CategoryCreate) -> EventCategory:
    category = EventCategory(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update_category(db: Session, category: EventCategory, category_in: CategoryUpdate) -> EventCategory:
    data = category_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category

def delete_category(db: Session, category: EventCategory) -> EventCategory:
    db.delete(category)
    db.commit()
    return category