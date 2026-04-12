from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import date


class DailyLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    log_date: date = Field(default_factory=date.today)
    calories: int = 0
    water_ml: int = 0
