from pydantic import BaseModel, ConfigDict


class LocationBase(BaseModel):
    name: str
    capacity: int | None = None
    room: str | None = None
    description: str | None = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: str | None = None
    capacity: int | None = None
    room: str | None = None
    description: str | None = None


class LocationRead(BaseModel):
    id: str

    model_config = ConfigDict(from_attributes=True)
