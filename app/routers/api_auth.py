from fastapi import Response, HTTPException, status
from app.dependencies import SessionDep
from app.schemas.chat import LoginRequest
from app.schemas.user import SignupRequest, UserResponse
from app.services.auth_service import AuthService
from app.repositories.user import UserRepository
from . import api_router


@api_router.post("/auth/login")
async def api_login(credentials: LoginRequest, response: Response, db: SessionDep):
    repo = UserRepository(db)
    service = AuthService(repo)
    token = service.authenticate_user(credentials.username, credentials.password)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
    )
    user = repo.get_by_username(credentials.username)
    return {"access_token": token, "user": UserResponse(id=user.id, username=user.username, email=user.email)}


@api_router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def api_register(data: SignupRequest, db: SessionDep):
    repo = UserRepository(db)
    service = AuthService(repo)
    try:
        user = service.register_user(data.username, data.email, data.password)
        return UserResponse(id=user.id, username=user.username, email=user.email)
    except Exception:
        raise HTTPException(status_code=400, detail="Username or email already exists")


@api_router.post("/auth/logout")
async def api_logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def get_me(db: SessionDep, request_obj: None = None):
    from fastapi import Request
    from app.dependencies.auth import get_current_user
    return {"ok": True}
