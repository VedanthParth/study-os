from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.planner import (
    PlanItemCreate,
    PlanItemResponse,
    PlanItemUpdate,
    StudyPlanCreate,
    StudyPlanResponse,
    StudyPlanUpdate,
)
from app.services.planner_service import PlannerService

router = APIRouter(prefix="/planner", tags=["planner"])


def _service(db: Session = Depends(get_db)) -> PlannerService:
    return PlannerService(db)


@router.get("/plans", response_model=list[StudyPlanResponse])
def list_plans(
    workspace_id: str = Query(...),
    service: PlannerService = Depends(_service),
) -> list[StudyPlanResponse]:
    return service.list_plans(workspace_id)


@router.post("/plans", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    payload: StudyPlanCreate,
    service: PlannerService = Depends(_service),
) -> StudyPlanResponse:
    return service.create_plan(payload)


@router.get("/plans/{plan_id}", response_model=StudyPlanResponse)
def get_plan(
    plan_id: str,
    service: PlannerService = Depends(_service),
) -> StudyPlanResponse:
    return service.get_plan(plan_id)


@router.patch("/plans/{plan_id}", response_model=StudyPlanResponse)
def update_plan(
    plan_id: str,
    payload: StudyPlanUpdate,
    service: PlannerService = Depends(_service),
) -> StudyPlanResponse:
    return service.update_plan(plan_id, payload)


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: str,
    service: PlannerService = Depends(_service),
) -> None:
    service.delete_plan(plan_id)


@router.post("/plans/{plan_id}/items", response_model=PlanItemResponse, status_code=status.HTTP_201_CREATED)
def add_item(
    plan_id: str,
    payload: PlanItemCreate,
    service: PlannerService = Depends(_service),
) -> PlanItemResponse:
    return service.add_item(plan_id, payload)


@router.patch("/items/{item_id}", response_model=PlanItemResponse)
def update_item(
    item_id: str,
    payload: PlanItemUpdate,
    service: PlannerService = Depends(_service),
) -> PlanItemResponse:
    return service.update_item(item_id, payload)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: str,
    service: PlannerService = Depends(_service),
) -> None:
    service.delete_item(item_id)
