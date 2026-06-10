"""AnalysisTask HTTP boundary for frozen input contract route stubs."""

from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from src.app.routes.runtime_contracts import (
    CreateAnalysisTaskRequest,
    RuntimeRouteStubErrorResponse,
    not_implemented_route_stub_response,
)

router = APIRouter(prefix="/analysis-tasks", tags=["analysis-tasks"])

NOT_IMPLEMENTED_RESPONSE: dict[int | str, dict[str, Any]] = {
    501: {
        "description": "Runtime route stub is registered but the real implementation is pending.",
        "model": RuntimeRouteStubErrorResponse,
    }
}


@router.post("", responses=NOT_IMPLEMENTED_RESPONSE)
def create_analysis_task(_request: CreateAnalysisTaskRequest) -> JSONResponse:
    """Register the AnalysisTask input boundary without returning fake success data."""

    return not_implemented_route_stub_response()
