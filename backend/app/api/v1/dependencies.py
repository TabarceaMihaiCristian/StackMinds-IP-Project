from typing import Generator, Literal

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_db() -> Generator[Generator, None, None]:
    db = SessionLocal()
    try:
        yield db # type: ignore
    finally:
        db.close()

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    
    credentials_exeption = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token_data = decode_token(token)
    except JWTError:
        raise credentials_exeption
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not bool(user.is_active):
        raise credentials_exeption

    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not bool(current_user.is_active):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def reqire_role(*allowed_roles: Literal["student", "organizer", "admin"]):
    def _role_dependecy(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:  
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted",
            )
        return current_user
    return _role_dependecy