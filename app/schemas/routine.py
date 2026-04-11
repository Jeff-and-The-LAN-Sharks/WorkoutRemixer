from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime


class RoutineCreate(SQLModel):
    name: str
    description: str = ""


class RoutineUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None


class RoutineExerciseCreate(SQLModel):
    exercise_id: int
    sets: int = 3
    target_reps: int = 10
    rest_seconds: int = 60
    order_index: int = 0


class RoutineExerciseResponse(SQLModel):
    id: int
    exercise_id: int
    exercise_name: str
    muscle_group: str
    sets: int
    target_reps: int
    rest_seconds: int
    order_index: int


class RoutineResponse(SQLModel):
    id: int
    name: str
    description: str
    user_id: int
    created_at: datetime
    exercises: list[RoutineExerciseResponse] = []
