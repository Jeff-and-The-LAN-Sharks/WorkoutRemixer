from sqlmodel import Session, select
from app.models.routine import Routine, RoutineExercise
from app.models.exercise import Exercise
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
            # Delete routine exercises first
            res = self.db.exec(
                select(RoutineExercise).where(RoutineExercise.routine_id == routine_id)
            ).all()
            for re in res:
                self.db.delete(re)
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

    def get_routine_exercises(self, routine_id: int):
        results = self.db.exec(
            select(RoutineExercise, Exercise)
            .join(Exercise, RoutineExercise.exercise_id == Exercise.id)
            .where(RoutineExercise.routine_id == routine_id)
            .order_by(RoutineExercise.order_index)
        ).all()
        return results
