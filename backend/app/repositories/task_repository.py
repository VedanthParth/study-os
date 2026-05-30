from datetime import UTC, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskReorderItem, TaskUpdate


class TaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_workspace(self, workspace_id: str) -> list[Task]:
        return (
            self.db.query(Task)
            .filter(Task.workspace_id == workspace_id)
            .order_by(Task.position.asc(), Task.created_at.asc())
            .all()
        )

    def get_by_id(self, task_id: str) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def next_position(self, workspace_id: str) -> int:
        result = (
            self.db.query(func.max(Task.position))
            .filter(Task.workspace_id == workspace_id)
            .scalar()
        )
        return (result if result is not None else -1) + 1

    def create(self, payload: TaskCreate, position: int) -> Task:
        data = payload.model_dump()
        data["position"] = position
        task = Task(**data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, payload: TaskUpdate) -> Task:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(task, field, value)
        task.updated_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def reorder(self, items: list[TaskReorderItem]) -> None:
        for item in items:
            self.db.query(Task).filter(Task.id == item.id).update(
                {"position": item.position}
            )
        self.db.commit()
