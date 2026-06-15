"""Workspace-scoped shared metric source routes for Dashboard and Metrics entry parity."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from src.app.auth import (
    AuthenticatedRequestContext,
    authenticated_request_context_dependency,
)
from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    MetricListResponse,
    MetricResponse,
    RuntimeRequestErrorResponse,
    runtime_error_response,
)
from src.infrastructure.database.runtime_foundation import (
    MetricRepository,
    RuntimeFoundationPyMySqlDatabase,
)

router = APIRouter(prefix="/metrics", tags=["metrics"])
AuthenticatedContext = Annotated[
    AuthenticatedRequestContext,
    Depends(authenticated_request_context_dependency),
]

METRIC_ERROR_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Authentication session is missing, invalid, expired, or revoked.",
        "model": RuntimeRequestErrorResponse,
    },
    404: {
        "description": "Requested metric was not found inside the current authenticated workspace.",
        "model": RuntimeRequestErrorResponse,
    },
}


def _runtime_foundation_database() -> RuntimeFoundationPyMySqlDatabase:
    settings = get_settings()
    return RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def _metric_repository() -> MetricRepository:
    return MetricRepository(_runtime_foundation_database())


@router.get(
    "",
    response_model=MetricListResponse,
    responses=METRIC_ERROR_RESPONSES,
)
def list_metrics(context: AuthenticatedContext) -> MetricListResponse:
    """List only the current authenticated workspace metrics."""

    return MetricListResponse(items=_metric_repository().list_by_workspace_id(context.workspaceId))


@router.get(
    "/{metricId}",
    response_model=MetricResponse,
    responses=METRIC_ERROR_RESPONSES,
)
def get_metric(
    metricId: str,
    context: AuthenticatedContext,
) -> MetricResponse | JSONResponse:
    """Read one metric only when it belongs to the current authenticated workspace."""

    try:
        metric = _metric_repository().get_by_metric_id_and_workspace_id(
            metricId,
            workspace_id=context.workspaceId,
        )
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Metric not found: {error.args[0]}",
        )

    return MetricResponse.model_validate(metric)
