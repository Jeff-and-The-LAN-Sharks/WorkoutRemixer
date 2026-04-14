from sqlmodel import Field, SQLModel
from typing import Optional


class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    gender: str = "male"
    activity_level: str = "moderate"

# The UserProfile model is designed to store additional information about the user that can be used for personalized workout recommendations and tracking.
