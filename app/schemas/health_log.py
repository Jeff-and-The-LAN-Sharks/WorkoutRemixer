from sqlmodel import SQLModel
from datetime import date
from typing import Optional


class DailyLogResponse(SQLModel):
    id: Optional[int]
    user_id: int
    log_date: date
    calories: int
    water_ml: int


class UpdateCalories(SQLModel):
    calories: int


class UpdateWater(SQLModel):
    water_ml: int
