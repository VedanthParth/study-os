from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.user import GuestUserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def _service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.post("/guest", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_guest(
    payload: GuestUserCreate,
    service: UserService = Depends(_service),
) -> UserResponse:
    return service.create_guest(payload)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    service: UserService = Depends(_service),
) -> UserResponse:
    return service.get_user(user_id)
