from fastapi import HTTPException, status
from app.dependencies import SessionDep, AuthDep
from app.repositories.routine import RoutineRepository
from app.services.routine_service import RoutineService
from app.schemas.routine import RoutineCreate, RoutineUpdate, RoutineExerciseCreate, RoutineResponse
from . import api_router


def _get_service(db) -> RoutineService:
    return RoutineService(RoutineRepository(db))


@api_router.get("/routines", response_model=list[RoutineResponse]) #This endpoint allows users to see a list of their routines. 
async def list_routines(db: SessionDep, user: AuthDep):
    return _get_service(db).get_user_routines(user.id)


@api_router.get("/routines/{routine_id}", response_model=RoutineResponse)
async def get_routine(routine_id: int, db: SessionDep, user: AuthDep):
    try:
        return _get_service(db).get_by_id(routine_id, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Routine not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")


@api_router.post("/routines", response_model=RoutineResponse, status_code=status.HTTP_201_CREATED)
async def create_routine(data: RoutineCreate, db: SessionDep, user: AuthDep):
    return _get_service(db).create(data, user.id)


@api_router.put("/routines/{routine_id}", response_model=RoutineResponse) #User can update the name and description of their routine here. 
async def update_routine(routine_id: int, data: RoutineUpdate, db: SessionDep, user: AuthDep):
    try:
        return _get_service(db).update(routine_id, data, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Routine not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")


@api_router.delete("/routines/{routine_id}", status_code=status.HTTP_204_NO_CONTENT) #ALlows user to delete a routine. (Remember to add a confirmation prompt on the frontend)
async def delete_routine(routine_id: int, db: SessionDep, user: AuthDep):
    try:
        _get_service(db).delete(routine_id, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Routine not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")


@api_router.post("/routines/{routine_id}/exercises", status_code=status.HTTP_201_CREATED) #Allows users to add an exercise to their routine.
async def add_exercise_to_routine(routine_id: int, data: RoutineExerciseCreate, db: SessionDep, user: AuthDep):
    try:
        return _get_service(db).add_exercise(routine_id, data, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Routine not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")


@api_router.delete("/routines/{routine_id}/exercises/{routine_exercise_id}", status_code=status.HTTP_204_NO_CONTENT) #Allows users to remove the exericses from their routine. (Remember to add a confirmation prompt on the frontend)
async def remove_exercise_from_routine(routine_id: int, routine_exercise_id: int, db: SessionDep, user: AuthDep):
    try:
        _get_service(db).remove_exercise(routine_id, routine_exercise_id, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")
