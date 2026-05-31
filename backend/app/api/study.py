from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.study_session import (
    StudySessionCreate,
    StudySessionPause,
    StudySessionResponse,
    StudySessionStop,
)
from app.services.study_service import StudyService

router = APIRouter(prefix="/study", tags=["study"])


def _service(db: Session = Depends(get_db)) -> StudyService:
    return StudyService(db)


@router.get("", response_model=list[StudySessionResponse])
def list_sessions(
    workspace_id: str = Query(...),
    service: StudyService = Depends(_service),
) -> list[StudySessionResponse]:
    return service.list_sessions(workspace_id)


@router.post("/start", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    payload: StudySessionCreate,
    service: StudyService = Depends(_service),
) -> StudySessionResponse:
    return service.start_session(payload)


@router.post("/pause/{session_id}", response_model=StudySessionResponse)
def pause_session(
    session_id: str,
    payload: StudySessionPause,
    service: StudyService = Depends(_service),
) -> StudySessionResponse:
    return service.pause_session(session_id, payload)


@router.post("/resume/{session_id}", response_model=StudySessionResponse)
def resume_session(
    session_id: str,
    service: StudyService = Depends(_service),
) -> StudySessionResponse:
    return service.resume_session(session_id)


@router.post("/stop/{session_id}", response_model=StudySessionResponse)
def stop_session(
    session_id: str,
    payload: StudySessionStop,
    service: StudyService = Depends(_service),
) -> StudySessionResponse:
    return service.stop_session(session_id, payload)
