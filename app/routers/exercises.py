from fastapi import HTTPException, status, Query
from typing import Optional
from app.dependencies import SessionDep, AuthDep
from app.repositories.exercise import ExerciseRepository
from app.services.exercise_service import ExerciseService
from app.schemas.exercise import ExerciseCreate, ExerciseResponse
from . import api_router


@api_router.get("/exercises", response_model=list[ExerciseResponse]) #This endpoint allows users to search for exercises, with optional query parameters for filtering by name or muscle group.
async def list_exercises(
    db: SessionDep,
    user: AuthDep,
    q: Optional[str] = Query(default=None),
    muscle_group: Optional[str] = Query(default=None),
):
    repo = ExerciseRepository(db)
    service = ExerciseService(repo)
    return service.search(query=q, muscle_group=muscle_group)


@api_router.get("/exercises/{exercise_id}", response_model=ExerciseResponse) #Allows the users to get the details on a specific exercise.
async def get_exercise(exercise_id: int, db: SessionDep, user: AuthDep):
    repo = ExerciseRepository(db)
    service = ExerciseService(repo)
    try:
        return service.get_by_id(exercise_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Exercise not found")


@api_router.post("/exercises", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED) #Allows users to create a new exercise.
async def create_exercise(data: ExerciseCreate, db: SessionDep, user: AuthDep):
    repo = ExerciseRepository(db)
    service = ExerciseService(repo)
    return service.create(data)
