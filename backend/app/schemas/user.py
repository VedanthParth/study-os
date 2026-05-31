from datetime import datetime

from pydantic import BaseModel


class GuestUserCreate(BaseModel):
    display_name: str = "Guest"


class UserResponse(BaseModel):
    id: str
    email: str | None
    display_name: str
    is_guest: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
