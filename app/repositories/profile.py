from sqlmodel import Session, select
from app.models.profile import UserProfile
from typing import Optional


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int) -> Optional[UserProfile]:
        return self.db.exec(
            select(UserProfile).where(UserProfile.user_id == user_id)
        ).first()

    def get_or_create(self, user_id: int) -> UserProfile:
        profile = self.get_by_user(user_id)
        if not profile:
            profile = UserProfile(user_id=user_id)
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def update(self, profile: UserProfile) -> UserProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile
