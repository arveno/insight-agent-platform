"""Health check route."""

from fastapi import APIRouter

from src.app.config import get_settings
from src.shared.types.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """返回服务最小健康状态，不访问数据库、模型或外部依赖。"""
    settings = get_settings()
    return HealthResponse(status="ok", service=settings.service_name, version=settings.version)
