from sqlmodel import Field, SQLModel
from typing import Optional


class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    muscle_group: str
    description: str = ""
    difficulty: str = "beginner"
    video_id: str = ""

#models are good we should add one for healthlog tho