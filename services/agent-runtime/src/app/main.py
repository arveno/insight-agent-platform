"""Agent Runtime FastAPI 入口模块。"""

from fastapi import FastAPI

from src.app.config import get_settings
from src.app.routes.health import router as health_router


def create_app() -> FastAPI:
    """创建最小 FastAPI 应用。"""
    settings = get_settings()
    application = FastAPI(title=settings.service_name, version=settings.version)
    application.include_router(health_router)
    return application


app = create_app()
