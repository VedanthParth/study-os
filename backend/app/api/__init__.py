from fastapi import APIRouter

from app.api.calendar import router as calendar_router
from app.api.tasks import router as tasks_router
from app.api.workspaces import router as workspaces_router

api_router = APIRouter(prefix="/api")
api_router.include_router(workspaces_router)
api_router.include_router(tasks_router)
api_router.include_router(calendar_router)
