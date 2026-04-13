from sqlmodel import SQLModel
from typing import Optional


class ProfileUpdate(SQLModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None


class ProfileResponse(SQLModel):
    id: Optional[int]
    user_id: int
    height_cm: Optional[float]
    weight_kg: Optional[float]
    age: Optional[int]
    gender: str
    activity_level: str

#recently changed this one