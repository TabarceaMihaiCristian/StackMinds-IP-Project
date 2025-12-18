from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db, require_role
from app.models import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserRead])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin")))-> List[User]:
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users

