from app.dependencies import SessionDep, AuthDep
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileResponse, ProfileUpdate
from . import api_router


@api_router.get("/profile", response_model=ProfileResponse) 
async def get_profile(db: SessionDep, user: AuthDep):
    return ProfileRepository(db).get_or_create(user.id)


@api_router.put("/profile", response_model=ProfileResponse)
async def update_profile(data: ProfileUpdate, db: SessionDep, user: AuthDep):
    repo = ProfileRepository(db)
    profile = repo.get_or_create(user.id)
    if data.height_cm is not None: profile.height_cm = data.height_cm
    if data.weight_kg is not None: profile.weight_kg = data.weight_kg
    if data.age is not None: profile.age = data.age
    if data.gender is not None: profile.gender = data.gender
    if data.activity_level is not None: profile.activity_level = data.activity_level
    return repo.update(profile)
