"""Agent Runtime FastAPI 入口模块。"""

from fastapi import FastAPI, Request

from src.app.auth import AuthContextResolutionError
from src.app.config import get_settings
from src.app.routes.analysis_runs import router as analysis_runs_router
from src.app.routes.analysis_tasks import router as analysis_tasks_router
from src.app.routes.auth import router as auth_router
from src.app.routes.conversations import router as conversations_router
from src.app.routes.health import router as health_router
from src.app.routes.runtime_contracts import runtime_error_response


def create_app() -> FastAPI:
    """创建最小 FastAPI 应用。"""
    settings = get_settings()
    application = FastAPI(title=settings.service_name, version=settings.version)

    @application.exception_handler(AuthContextResolutionError)
    async def handle_auth_context_resolution_error(
        _request: Request,
        error: AuthContextResolutionError,
    ):
        return runtime_error_response(
            status_code=error.status_code,
            error_code=error.error_code,
            message=error.message,
        )

    application.include_router(health_router)
    application.include_router(auth_router)
    application.include_router(analysis_tasks_router)
    application.include_router(conversations_router)
    application.include_router(analysis_runs_router)
    return application


app = create_app()
