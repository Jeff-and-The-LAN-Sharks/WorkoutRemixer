from sqlmodel import SQLModel
from typing import Optional


class ExerciseCreate(SQLModel):
    name: str
    muscle_group: str
    description: str = ""
    difficulty: str = "beginner"


class ExerciseResponse(SQLModel):
    id: int
    name: str
    muscle_group: str
    description: str
    difficulty: str
