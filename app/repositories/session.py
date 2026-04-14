from sqlmodel import Session, select
from app.models.session import WorkoutSession, CompletedSet
from app.models.exercise import Exercise
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, session: WorkoutSession) -> WorkoutSession:
        try:
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            return session
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            self.db.rollback()
            raise

    def get_by_id(self, session_id: int) -> Optional[WorkoutSession]:
        return self.db.get(WorkoutSession, session_id)

    def get_by_user(self, user_id: int) -> list[WorkoutSession]:
        return self.db.exec(
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.started_at.desc())
        ).all()

    def update(self, session: WorkoutSession) -> WorkoutSession:
        try:
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            return session
        except Exception as e:
            logger.error(f"Error updating session: {e}")
            self.db.rollback()
            raise

    def add_completed_set(self, completed_set: CompletedSet) -> CompletedSet: #Adding the try because I had some weird issues with the DB session
        try:
            self.db.add(completed_set)
            self.db.commit()
            self.db.refresh(completed_set)
            return completed_set
        except Exception as e:
            logger.error(f"Error adding completed set: {e}")
            self.db.rollback()
            raise

    def get_sets_for_session(self, session_id: int): # Using the join so the UI can get the exercise details along with the completed set info in one query.
        results = self.db.exec(
            select(CompletedSet, Exercise)
            .join(Exercise, CompletedSet.exercise_id == Exercise.id)
            .where(CompletedSet.session_id == session_id)
        ).all()
        return results
    def delete(self, session_id: int) -> None:
        session = self.db.get(WorkoutSession, session_id)
        if not session:
            return
        sets = self.db.exec(
            select(CompletedSet).where(CompletedSet.session_id == session_id)
        ).all()
        for s in sets:
            self.db.delete(s)
        self.db.delete(session)
        self.db.commit()
