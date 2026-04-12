from fastapi import HTTPException
from app.dependencies import SessionDep, AuthDep
from app.repositories.health_log import HealthLogRepository
from app.schemas.health_log import DailyLogResponse, UpdateCalories, UpdateWater
from . import api_router


def _repo(db) -> HealthLogRepository:
    return HealthLogRepository(db)


@api_router.get("/health/today", response_model=DailyLogResponse)
async def get_today(db: SessionDep, user: AuthDep):
    return _repo(db).get_or_create_today(user.id)


@api_router.post("/health/calories", response_model=DailyLogResponse)
async def update_calories(data: UpdateCalories, db: SessionDep, user: AuthDep):
    repo = _repo(db)
    log = repo.get_or_create_today(user.id)
    log.calories = data.calories
    return repo.update(log)


@api_router.post("/health/water", response_model=DailyLogResponse)
async def update_water(data: UpdateWater, db: SessionDep, user: AuthDep):
    repo = _repo(db)
    log = repo.get_or_create_today(user.id)
    log.water_ml = data.water_ml
    return repo.update(log)


@api_router.get("/health/history", response_model=list[DailyLogResponse])
async def get_history(db: SessionDep, user: AuthDep):
    return _repo(db).get_history(user.id)
