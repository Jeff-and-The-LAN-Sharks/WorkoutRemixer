from sqlmodel import Session, select
from app.models.routine import Routine, RoutineExercise
from app.models.exercise import Exercise
from app.models.session import WorkoutSession, CompletedSet
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class RoutineRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int) -> list[Routine]:
        return self.db.exec(
            select(Routine).where(Routine.user_id == user_id)
        ).all()

    def get_by_id(self, routine_id: int) -> Optional[Routine]:
        return self.db.get(Routine, routine_id)

    #Wrapped create and update in try/except blocks so that it rolls back if it fails so the DB session doesn't get permanently locked up.
    def create(self, routine: Routine) -> Routine:
        try:
            self.db.add(routine)
            self.db.commit()
            self.db.refresh(routine)
            return routine
        except Exception as e:
            logger.error(f"Error creating routine: {e}")
            self.db.rollback()
            raise

    def update(self, routine: Routine) -> Routine:
        try:
            self.db.add(routine)
            self.db.commit()
            self.db.refresh(routine)
            return routine
        except Exception as e:
            logger.error(f"Error updating routine: {e}")
            self.db.rollback()
            raise

    def delete(self, routine_id: int):
        try:
            #Delete completed sets linked to sessions of this routine
            sessions = self.db.exec(
                select(WorkoutSession).where(WorkoutSession.routine_id == routine_id)
            ).all()
            for session in sessions:
                sets = self.db.exec(
                    select(CompletedSet).where(CompletedSet.session_id == session.id)
                ).all()
                for s in sets:
                    self.db.delete(s)
                self.db.delete(session)

            #Delete routine exercises
            routine_exercises = self.db.exec(
                select(RoutineExercise).where(RoutineExercise.routine_id == routine_id)
            ).all()
            for re in routine_exercises:
                self.db.delete(re)

            #Delete the routine itself
            routine = self.db.get(Routine, routine_id)
            if routine:
                self.db.delete(routine)

            self.db.commit()
        except Exception as e:
            logger.error(f"Error deleting routine: {e}")
            self.db.rollback()
            raise

    def add_exercise(self, routine_exercise: RoutineExercise) -> RoutineExercise:
        try:
            self.db.add(routine_exercise)
            self.db.commit()
            self.db.refresh(routine_exercise)
            return routine_exercise
        except Exception as e:
            logger.error(f"Error adding exercise to routine: {e}")
            self.db.rollback()
            raise

    def remove_exercise(self, routine_exercise_id: int):
        try:
            re = self.db.get(RoutineExercise, routine_exercise_id)
            if re:
                self.db.delete(re)
                self.db.commit()
        except Exception as e:
            logger.error(f"Error removing exercise from routine: {e}")
            self.db.rollback()
            raise

    # Using a the inner join here so the UI can get the actual Exercise details (name, muscle group) 
    def get_routine_exercises(self, routine_id: int):
        results = self.db.exec(
            select(RoutineExercise, Exercise)
            .join(Exercise, RoutineExercise.exercise_id == Exercise.id)
            .where(RoutineExercise.routine_id == routine_id)
            .order_by(RoutineExercise.order_index)
        ).all()
        return results