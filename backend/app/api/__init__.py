from fastapi import APIRouter

from app.api.workspaces import router as workspaces_router

api_router = APIRouter(prefix="/api")
api_router.include_router(workspaces_router)
