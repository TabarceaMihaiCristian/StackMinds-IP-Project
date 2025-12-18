from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

class RegistrationBase(BaseModel):
    status: str = "registered"
    feedback: Optional[str] = None

class RegistrationCreate(RegistrationBase):
    event_id: str

class RegistrationRead(BaseModel):
    id: str
    user_id: str
    event_id: str
    status: str
    registered_at: datetime
    checkin_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)