from fastapi import APIRouter

from app.api.analytics import router as analytics_router
from app.api.calendar import router as calendar_router
from app.api.planner import router as planner_router
from app.api.study import router as study_router
from app.api.tasks import router as tasks_router
from app.api.users import router as users_router
from app.api.workspace_views import router as workspace_views_router
from app.api.workspaces import router as workspaces_router
from app.core.config import settings

api_router = APIRouter(prefix=settings.API_PREFIX)
api_router.include_router(users_router)
api_router.include_router(workspaces_router)
api_router.include_router(workspace_views_router)
api_router.include_router(tasks_router)
api_router.include_router(calendar_router)
api_router.include_router(study_router)
api_router.include_router(analytics_router)
api_router.include_router(planner_router)
