from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.calendar_event import (
    CalendarEventCreate,
    CalendarEventResponse,
    CalendarEventUpdate,
)
from app.services.calendar_service import CalendarService

router = APIRouter(prefix="/calendar", tags=["calendar"])


def _service(db: Session = Depends(get_db)) -> CalendarService:
    return CalendarService(db)


@router.get("", response_model=list[CalendarEventResponse])
def list_events(
    workspace_id: str = Query(...),
    service: CalendarService = Depends(_service),
) -> list[CalendarEventResponse]:
    return service.list_events(workspace_id)


@router.post("", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: CalendarEventCreate,
    service: CalendarService = Depends(_service),
) -> CalendarEventResponse:
    return service.create_event(payload)


@router.patch("/{event_id}", response_model=CalendarEventResponse)
def update_event(
    event_id: str,
    payload: CalendarEventUpdate,
    service: CalendarService = Depends(_service),
) -> CalendarEventResponse:
    return service.update_event(event_id, payload)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    service: CalendarService = Depends(_service),
) -> None:
    service.delete_event(event_id)
