from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import cast

from app.api.v1.dependencies import get_db, get_current_active_user
from app.core.security import verify_password, create_access_token, hash_password
from app.models import User
from app.schemas import Token, LoginRequest, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
 
    if not user or not verify_password(credentials.password, cast(str, user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
 
    access_token = create_access_token(user_id=str(user.id), role=str(user.role))
    return Token(access_token=access_token, token_type="bearer")

@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user