from app.repositories.routine import RoutineRepository
from app.models.routine import Routine, RoutineExercise
from app.schemas.routine import RoutineCreate, RoutineUpdate, RoutineExerciseCreate, RoutineExerciseResponse, RoutineResponse


class RoutineService:
    def __init__(self, repo: RoutineRepository):
        self.repo = repo

    def get_user_routines(self, user_id: int) -> list[RoutineResponse]: #This method gets all the routines for the user and can be used to display them on the dashboard.
        routines = self.repo.get_by_user(user_id)
        result = []
        for r in routines:
            exercises = self._get_exercises(r.id)
            result.append(RoutineResponse(
                id=r.id,
                name=r.name,
                description=r.description,
                user_id=r.user_id,
                created_at=r.created_at,
                exercises=exercises
            ))
        return result

    def get_by_id(self, routine_id: int, user_id: int) -> RoutineResponse: #This method gets the details of a specific routine and it cane be used on the routine detail page. 
        routine = self.repo.get_by_id(routine_id)
        if not routine:
            raise ValueError("Routine not found")
        if routine.user_id != user_id:
            raise PermissionError("Not your routine")
        exercises = self._get_exercises(routine_id)
        return RoutineResponse(
            id=routine.id,
            name=routine.name,
            description=routine.description,
            user_id=routine.user_id,
            created_at=routine.created_at,
            exercises=exercises
        )

    def create(self, data: RoutineCreate, user_id: int) -> RoutineResponse: 
        routine = Routine(name=data.name, description=data.description, user_id=user_id)
        saved = self.repo.create(routine)
        return RoutineResponse(
            id=saved.id,
            name=saved.name,
            description=saved.description,
            user_id=saved.user_id,
            created_at=saved.created_at,
            exercises=[]
        )

    def update(self, routine_id: int, data: RoutineUpdate, user_id: int) -> RoutineResponse:
        routine = self.repo.get_by_id(routine_id)
        if not routine:
            raise ValueError("Routine not found")
        if routine.user_id != user_id:
            raise PermissionError("Not your routine")
        if data.name is not None:
            routine.name = data.name
        if data.description is not None:
            routine.description = data.description
        saved = self.repo.update(routine)
        exercises = self._get_exercises(routine_id)
        return RoutineResponse(
            id=saved.id,
            name=saved.name,
            description=saved.description,
            user_id=saved.user_id,
            created_at=saved.created_at,
            exercises=exercises
        )

    def delete(self, routine_id: int, user_id: int):
        routine = self.repo.get_by_id(routine_id)
        if not routine:
            raise ValueError("Routine not found")
        if routine.user_id != user_id:
            raise PermissionError("Not your routine")
        self.repo.delete(routine_id)

    def add_exercise(self, routine_id: int, data: RoutineExerciseCreate, user_id: int): #Allows users to add exercises to their routine and specify the details for each exercise (sets, reps, rest time, and whatever else we want to add.)
        routine = self.repo.get_by_id(routine_id)
        if not routine:
            raise ValueError("Routine not found")
        if routine.user_id != user_id:
            raise PermissionError("Not your routine")
        re = RoutineExercise(
            routine_id=routine_id,
            exercise_id=data.exercise_id,
            sets=data.sets,
            target_reps=data.target_reps,
            rest_seconds=data.rest_seconds,
            order_index=data.order_index
        )
        return self.repo.add_exercise(re)

    def remove_exercise(self, routine_id: int, routine_exercise_id: int, user_id: int):
        routine = self.repo.get_by_id(routine_id)
        if not routine:
            raise ValueError("Routine not found")
        if routine.user_id != user_id:
            raise PermissionError("Not your routine")
        self.repo.remove_exercise(routine_exercise_id)

    def _get_exercises(self, routine_id: int) -> list[RoutineExerciseResponse]:
        rows = self.repo.get_routine_exercises(routine_id)
        return [
            RoutineExerciseResponse(
                id=re.id,
                exercise_id=re.exercise_id,
                exercise_name=ex.name,
                muscle_group=ex.muscle_group,
                sets=re.sets,
                target_reps=re.target_reps,
                rest_seconds=re.rest_seconds,
                order_index=re.order_index
            )
            for re, ex in rows
        ]
