from fastapi import HTTPException, status
from app.dependencies import SessionDep, AuthDep
from app.repositories.session import SessionRepository
from app.services.session_service import SessionService
from app.schemas.session import SessionCreate, CompletedSetCreate, SessionCompleteRequest, SessionResponse
from . import api_router


def _get_service(db) -> SessionService:
    return SessionService(SessionRepository(db))


@api_router.get("/sessions", response_model=list[SessionResponse]) #Users can see thier sesion history.
async def list_sessions(db: SessionDep, user: AuthDep):
    return _get_service(db).get_history(user.id)


@api_router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED) #User starts a new workout session
async def create_session(data: SessionCreate, db: SessionDep, user: AuthDep):
    return _get_service(db).create(data, user.id)


@api_router.post("/sessions/{session_id}/complete", response_model=SessionResponse) #User can mark their session as complete and log the duration of their workout
async def complete_session(session_id: int, data: SessionCompleteRequest, db: SessionDep, user: AuthDep):
    try:
        return _get_service(db).complete(session_id, data.duration_seconds, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")


@api_router.post("/sessions/{session_id}/sets", status_code=status.HTTP_201_CREATED) #User can log the sets they completed during their workout session here. (We can expand this later to include more details like weight lifted, rest time, etc.)
async def log_set(session_id: int, data: CompletedSetCreate, db: SessionDep, user: AuthDep):
    try:
        return _get_service(db).add_set(session_id, data, user.id)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")
    
@api_router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT) #Allows users to delete a workout session. (Remember to add a confirmation prompt on the frontend)
async def delete_session(session_id: int, db: SessionDep, user: AuthDep):
    try:
        _get_service(db).delete(session_id, user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not authorized")
