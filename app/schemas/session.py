from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime


class SessionCreate(SQLModel):
    routine_id: Optional[int] = None


class CompletedSetCreate(SQLModel):
    exercise_id: int
    reps_completed: int
    form_score: float = 0.0
    set_number: int = 1


class SessionCompleteRequest(SQLModel):
    duration_seconds: int


class CompletedSetResponse(SQLModel):
    id: int
    exercise_id: int
    exercise_name: str
    reps_completed: int
    form_score: float
    set_number: int


class SessionResponse(SQLModel):
    id: int
    user_id: int
    routine_id: Optional[int]
    started_at: datetime
    duration_seconds: int
    completed: bool
    sets: list[CompletedSetResponse] = []
