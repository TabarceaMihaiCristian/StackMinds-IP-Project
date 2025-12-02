from typing import Optional
from pydantic import BaseModel

class LocationBase(BaseModel):
    name: str
    capacity: Optional[int] = None
    room: Optional[str] = None
    description: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    room: Optional[str] = None
    description: Optional[str] = None

class LocationRead(BaseModel):
    id: str

    class Config:
        orm_mode = True