from sqlmodel import Session, select
from app.models.exercise import Exercise
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class ExerciseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Exercise]:
        return self.db.exec(select(Exercise)).all()

    def get_by_id(self, exercise_id: int) -> Optional[Exercise]:
        return self.db.get(Exercise, exercise_id)

    def get_by_muscle_group(self, muscle_group: str) -> list[Exercise]:
        return self.db.exec(
            select(Exercise).where(Exercise.muscle_group == muscle_group)
        ).all()

    def search(self, query: str) -> list[Exercise]:
        return self.db.exec(
            select(Exercise).where(Exercise.name.ilike(f"%{query}%"))
        ).all()

    def create(self, exercise: Exercise) -> Exercise:
        try:
            self.db.add(exercise)
            self.db.commit()
            self.db.refresh(exercise)
            return exercise
        except Exception as e:
            logger.error(f"Error creating exercise: {e}")
            self.db.rollback()
            raise

    def exists_by_name(self, name: str) -> bool:
        return self.db.exec(
            select(Exercise).where(Exercise.name == name)
        ).first() is not None

#the repos are complete