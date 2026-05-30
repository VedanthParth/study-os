from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.task import TaskCreate, TaskReorder, TaskResponse, TaskUpdate
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    workspace_id: str = Query(...),
    service: TaskService = Depends(_service),
) -> list[TaskResponse]:
    return service.list_tasks(workspace_id)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    service: TaskService = Depends(_service),
) -> TaskResponse:
    return service.create_task(payload)


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_tasks(
    payload: TaskReorder,
    service: TaskService = Depends(_service),
) -> None:
    service.reorder_tasks(payload)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    service: TaskService = Depends(_service),
) -> TaskResponse:
    return service.update_task(task_id, payload)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    service: TaskService = Depends(_service),
) -> None:
    service.delete_task(task_id)
