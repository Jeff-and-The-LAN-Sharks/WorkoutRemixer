from sqlmodel import SQLModel
from typing import Optional


class ExerciseCreate(SQLModel):
    name: str
    muscle_group: str
    description: str = ""
    difficulty: str = "beginner"
    video_id: str = ""


class ExerciseResponse(SQLModel):
    id: int
    name: str
    muscle_group: str
    description: str
    difficulty: str
    video_id: str
