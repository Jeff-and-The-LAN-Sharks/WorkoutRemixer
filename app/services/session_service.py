from app.repositories.session import SessionRepository
from app.models.session import WorkoutSession, CompletedSet
from app.schemas.session import SessionCreate, CompletedSetCreate, SessionResponse, CompletedSetResponse


class SessionService:
    def __init__(self, repo: SessionRepository):
        self.repo = repo

    def create(self, data: SessionCreate, user_id: int) -> SessionResponse:
        session = WorkoutSession(user_id=user_id, routine_id=data.routine_id)
        saved = self.repo.create(session)
        return SessionResponse(
            id=saved.id, user_id=saved.user_id, routine_id=saved.routine_id,
            started_at=saved.started_at, duration_seconds=saved.duration_seconds,
            completed=saved.completed, sets=[]
        )

    def complete(self, session_id: int, duration_seconds: int, user_id: int) -> SessionResponse:
        session = self.repo.get_by_id(session_id)
        if not session:
            raise ValueError("Session not found")
        if session.user_id != user_id:
            raise PermissionError("Not your session")
        session.duration_seconds = duration_seconds
        session.completed = True
        saved = self.repo.update(session)
        sets = self._get_sets(session_id)
        return SessionResponse(
            id=saved.id, user_id=saved.user_id, routine_id=saved.routine_id,
            started_at=saved.started_at, duration_seconds=saved.duration_seconds,
            completed=saved.completed, sets=sets
        )

    def add_set(self, session_id: int, data: CompletedSetCreate, user_id: int):
        session = self.repo.get_by_id(session_id)
        if not session or session.user_id != user_id:
            raise PermissionError("Invalid session")
        completed_set = CompletedSet(
            session_id=session_id,
            exercise_id=data.exercise_id,
            reps_completed=data.reps_completed,
            form_score=data.form_score,
            set_number=data.set_number
        )
        return self.repo.add_completed_set(completed_set)

    def get_history(self, user_id: int) -> list[SessionResponse]:
        sessions = self.repo.get_by_user(user_id)
        result = []
        for s in sessions:
            sets = self._get_sets(s.id)
            result.append(SessionResponse(
                id=s.id, user_id=s.user_id, routine_id=s.routine_id,
                started_at=s.started_at, duration_seconds=s.duration_seconds,
                completed=s.completed, sets=sets
            ))
        return result

    def _get_sets(self, session_id: int) -> list[CompletedSetResponse]:
        rows = self.repo.get_sets_for_session(session_id)
        return [
            CompletedSetResponse(
                id=cs.id, exercise_id=cs.exercise_id, exercise_name=ex.name,
                reps_completed=cs.reps_completed, form_score=cs.form_score,
                set_number=cs.set_number
            )
            for cs, ex in rows
        ]
    
    def delete(self, session_id: int, user_id: int) -> None:
        session = self.repo.get_by_id(session_id)
        if not session:
            raise ValueError("Session not found")
        if session.user_id != user_id:
            raise PermissionError("Not your session")
        self.repo.delete(session_id)
