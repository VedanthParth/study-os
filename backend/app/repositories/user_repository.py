from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_guest(self, display_name: str) -> User:
        user = User(display_name=display_name, is_guest=True)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
