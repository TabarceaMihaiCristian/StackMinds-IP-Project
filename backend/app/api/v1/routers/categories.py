from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db, get_current_active_user, require_role
from app.models import User
from app.repositories import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)
from app.schemas import CategoryRead, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryRead], status_code=status.HTTP_200_OK)
def list_categories(skip: int = 0, limit: int = Query(10, le=100), db: Session = Depends(get_db)):
    categories = get_categories(db, skip=skip, limit=limit)
    return categories

@router.get("/{category_id}", response_model=CategoryRead, status_code=status.HTTP_200_OK)
def get_category_by_id(category_id: str, db: Session = Depends(get_db)):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_new_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    category = create_category(db, category_in)
    return category

@router.put("/{category_id}", response_model=CategoryRead, status_code=status.HTTP_200_OK)
def update_existing_category(category_id: str, category_in: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    category = update_category(db, category, category_in)
    return category

@router.delete("/{category_id}", response_model=CategoryRead, status_code=status.HTTP_200_OK)
def delete_existing_category(category_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    category = delete_category(db, category)
    return category