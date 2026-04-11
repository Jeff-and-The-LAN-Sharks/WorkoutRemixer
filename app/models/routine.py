from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class Routine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RoutineExercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    routine_id: int = Field(foreign_key="routine.id")
    exercise_id: int = Field(foreign_key="exercise.id")
    sets: int = 3
    target_reps: int = 10
    rest_seconds: int = 60
    order_index: int = 0
