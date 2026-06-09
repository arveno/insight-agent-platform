"""AnalysisRun HTTP boundary for lifecycle-owned route stubs."""

from typing import Any

from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

from src.app.routes.runtime_contracts import (
    ApprovalDecisionRequest,
    CreateAnalysisRunRequest,
    RuntimeRouteStubErrorResponse,
    not_implemented_route_stub_response,
)

router = APIRouter(prefix="/analysis-runs", tags=["analysis-runs"])

NOT_IMPLEMENTED_RESPONSE: dict[int | str, dict[str, Any]] = {
    501: {
        "description": "Runtime route stub is registered but the real implementation is pending.",
        "model": RuntimeRouteStubErrorResponse,
    }
}


@router.post("", responses=NOT_IMPLEMENTED_RESPONSE)
def create_analysis_run(_request: CreateAnalysisRunRequest) -> JSONResponse:
    """Register the AnalysisRun create boundary without starting real runtime execution."""

    return not_implemented_route_stub_response()


@router.get("/{runId}", responses=NOT_IMPLEMENTED_RESPONSE)
def get_analysis_run(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Reserve the AnalysisRun read boundary for the analysis_runs owner module."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/events", responses=NOT_IMPLEMENTED_RESPONSE)
def list_analysis_run_events(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Register the RunEvent collection boundary without emitting synthetic event data."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/tool-calls", responses=NOT_IMPLEMENTED_RESPONSE)
def list_analysis_run_tool_calls(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Register the ToolCall collection boundary without executing tools."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/model-calls", responses=NOT_IMPLEMENTED_RESPONSE)
def list_analysis_run_model_calls(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Register the ModelCall collection boundary without invoking the model gateway."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/source-evidence", responses=NOT_IMPLEMENTED_RESPONSE)
def list_analysis_run_source_evidence(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Register the SourceEvidence collection boundary without retrieving evidence."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/reports", responses=NOT_IMPLEMENTED_RESPONSE)
def list_analysis_run_reports(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Register the Report collection boundary without generating or persisting reports."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/execution-attempts", responses=NOT_IMPLEMENTED_RESPONSE)
def list_execution_attempts(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Reserve the ExecutionAttempt read boundary while worker ownership remains unimplemented."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/approvals", responses=NOT_IMPLEMENTED_RESPONSE)
def list_approval_requests(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Reserve the ApprovalRequest read boundary without faking approval state."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get("/{runId}/conversation", responses=NOT_IMPLEMENTED_RESPONSE)
def get_analysis_run_conversation(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Expose the run-to-conversation boundary without persisting cross-object joins."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.post("/{runId}/cancel", responses=NOT_IMPLEMENTED_RESPONSE)
def cancel_analysis_run(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Reserve the cancellation boundary without altering runtime state."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.post("/{runId}/retry", responses=NOT_IMPLEMENTED_RESPONSE)
def retry_analysis_run(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Reserve the retry boundary without creating a synthetic follow-up run."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.post("/{runId}/approvals/{approvalId}/decision", responses=NOT_IMPLEMENTED_RESPONSE)
def decide_approval_request(
    _request: ApprovalDecisionRequest,
    run_id: str = Path(alias="runId"),
    approval_id: str = Path(alias="approvalId"),
) -> JSONResponse:
    """Reserve the approval decision boundary without performing a real workflow transition."""

    _ = (run_id, approval_id)
    return not_implemented_route_stub_response()
