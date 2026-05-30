from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.task import TaskCreate, TaskReorder, TaskResponse, TaskUpdate


class TaskService:
    def __init__(self, db: Session) -> None:
        self.repo = TaskRepository(db)
        self.workspace_repo = WorkspaceRepository(db)

    def _require_workspace(self, workspace_id: str) -> None:
        if not self.workspace_repo.get_by_id(workspace_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )

    def _require_task(self, task_id: str) -> Task:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        return task

    def list_tasks(self, workspace_id: str) -> list[TaskResponse]:
        self._require_workspace(workspace_id)
        return [TaskResponse.model_validate(t) for t in self.repo.list_by_workspace(workspace_id)]

    def create_task(self, payload: TaskCreate) -> TaskResponse:
        self._require_workspace(payload.workspace_id)
        position = self.repo.next_position(payload.workspace_id)
        task = self.repo.create(payload, position)
        return TaskResponse.model_validate(task)

    def update_task(self, task_id: str, payload: TaskUpdate) -> TaskResponse:
        task = self._require_task(task_id)
        updated = self.repo.update(task, payload)
        return TaskResponse.model_validate(updated)

    def delete_task(self, task_id: str) -> None:
        task = self._require_task(task_id)
        self.repo.delete(task)

    def reorder_tasks(self, payload: TaskReorder) -> None:
        for item in payload.items:
            self._require_task(item.id)
        self.repo.reorder(payload.items)
