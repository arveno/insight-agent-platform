"""Agent Runtime FastAPI 入口模块。"""

from fastapi import FastAPI

from app.api.routes import health
from app.core.config import get_settings


def create_app() -> FastAPI:
    """创建最小 FastAPI 应用。"""
    settings = get_settings()
    application = FastAPI(title=settings.service_name, version=settings.version)
    application.include_router(health.router)
    return application


app = create_app()
