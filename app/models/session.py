from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class WorkoutSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    routine_id: Optional[int] = Field(default=None, foreign_key="routine.id")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    duration_seconds: int = 0
    completed: bool = False


class CompletedSet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="workoutsession.id")
    exercise_id: int = Field(foreign_key="exercise.id")
    reps_completed: int = 0
    form_score: float = 0.0
    set_number: int = 1


    #If we want to track more details about each set (like weight used, or notes), we can add more fields here later. 
    #For now, this should cover the basics of tracking completed sets within a workout session.
