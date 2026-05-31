from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.analytics import AnalyticsOverviewResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _service(db: Session = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_overview(
    workspace_id: str = Query(...),
    service: AnalyticsService = Depends(_service),
) -> AnalyticsOverviewResponse:
    return service.get_overview(workspace_id)
