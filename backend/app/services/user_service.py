from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user import GuestUserCreate, UserResponse


class UserService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def create_guest(self, payload: GuestUserCreate) -> UserResponse:
        user = self.repo.create_guest(payload.display_name)
        return UserResponse.model_validate(user)

    def get_user(self, user_id: str) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)
