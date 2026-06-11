"""AnalysisRun HTTP boundary for lifecycle-owned foundation APIs."""

from typing import Any

from fastapi import APIRouter, Path, status
from fastapi.responses import JSONResponse

from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    AnalysisRunResponse,
    ApprovalDecisionRequest,
    ConversationResponse,
    CreateAnalysisRunRequest,
    DecisionListResponse,
    ExecutionAttemptListResponse,
    ReportListResponse,
    RunEventListResponse,
    RuntimeRequestErrorResponse,
    RuntimeRouteStubErrorResponse,
    SourceEvidenceListResponse,
    generate_canonical_id,
    not_implemented_route_stub_response,
    runtime_error_response,
    utc_timestamp,
)
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    DecisionRepository,
    ExecutionAttemptRepository,
    ReportRepository,
    RunEventRepository,
    RuntimeFoundationPyMySqlDatabase,
    SourceEvidenceRepository,
)
from src.modules.analysis_runs.lifecycle_service import (
    AnalysisRunInvalidStateError,
    AnalysisRunLifecycleService,
    build_run_created_event,
)

router = APIRouter(prefix="/analysis-runs", tags=["analysis-runs"])

NOT_IMPLEMENTED_RESPONSE: dict[int | str, dict[str, Any]] = {
    501: {
        "description": "Runtime route stub is registered but the real implementation is pending.",
        "model": RuntimeRouteStubErrorResponse,
    }
}

FOUNDATION_ERROR_RESPONSE: dict[int | str, dict[str, Any]] = {
    404: {
        "description": "Requested AnalysisTask, Conversation, or AnalysisRun was not found.",
        "model": RuntimeRequestErrorResponse,
    },
    409: {
        "description": (
            "Request chain mismatched persisted objects or attempted "
            "an invalid lifecycle transition."
        ),
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


def _analysis_task_repository() -> AnalysisTaskRepository:
    return AnalysisTaskRepository(_runtime_foundation_database())


def _conversation_repository() -> ConversationRepository:
    return ConversationRepository(_runtime_foundation_database())


def _analysis_run_repository() -> AnalysisRunRepository:
    return AnalysisRunRepository(_runtime_foundation_database())


def _run_event_repository() -> RunEventRepository:
    return RunEventRepository(_runtime_foundation_database())


def _source_evidence_repository() -> SourceEvidenceRepository:
    return SourceEvidenceRepository(_runtime_foundation_database())


def _report_repository() -> ReportRepository:
    return ReportRepository(_runtime_foundation_database())


def _decision_repository() -> DecisionRepository:
    return DecisionRepository(_runtime_foundation_database())


def _analysis_run_lifecycle_repository() -> AnalysisRunLifecycleRepository:
    return AnalysisRunLifecycleRepository(_runtime_foundation_database())


def _analysis_run_lifecycle_service() -> AnalysisRunLifecycleService:
    database = _runtime_foundation_database()
    return AnalysisRunLifecycleService(
        analysis_run_repository=AnalysisRunRepository(database),
        execution_attempt_repository=ExecutionAttemptRepository(database),
        lifecycle_repository=AnalysisRunLifecycleRepository(database),
    )


def _validate_conversation_chain(
    *,
    request: CreateAnalysisRunRequest,
    conversation: ConversationRecord,
) -> JSONResponse | None:
    if conversation["analysisTaskId"] != request.analysisTaskId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="Conversation.analysisTaskId does not match request.analysisTaskId",
        )
    if conversation["workspaceId"] != request.workspaceId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="Conversation.workspaceId does not match request.workspaceId",
        )
    if conversation["userId"] != request.userId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="Conversation.userId does not match request.userId",
        )
    return None


@router.post(
    "",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_201_CREATED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def create_analysis_run(request: CreateAnalysisRunRequest) -> AnalysisRunRecord | JSONResponse:
    """Create a real AnalysisRun and attach it to the current Conversation."""

    try:
        conversation = _conversation_repository().get_by_conversation_id(request.conversationId)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {request.conversationId}",
        )

    conversation_chain_error = _validate_conversation_chain(
        request=request,
        conversation=conversation,
    )
    if conversation_chain_error is not None:
        return conversation_chain_error

    try:
        analysis_task = _analysis_task_repository().get_by_analysis_task_id(request.analysisTaskId)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisTask not found: {request.analysisTaskId}",
        )

    if analysis_task["workspaceId"] != request.workspaceId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="AnalysisTask.workspaceId does not match request.workspaceId",
        )
    if analysis_task["userId"] != request.userId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="AnalysisTask.userId does not match request.userId",
        )

    now = utc_timestamp()
    analysis_run: AnalysisRunRecord = {
        "runId": generate_canonical_id("analysis-run"),
        "workspaceId": request.workspaceId,
        "userId": request.userId,
        "analysisTaskId": request.analysisTaskId,
        "status": "created",
        "phase": "intake",
        "outcome": None,
        "waitingFor": None,
        "createdAt": now,
        "validatingAt": None,
        "queuedAt": None,
        "startedAt": None,
        "waitingSince": None,
        "timeoutAt": None,
        "cancelRequestedAt": None,
        "cancellingAt": None,
        "completedAt": None,
        "failedAt": None,
        "cancelledAt": None,
        "expiredAt": None,
        "rejectedAt": None,
        "terminalReason": None,
        "failureCode": None,
        "retryable": True,
        "retryOfRunId": None,
        "originalRunId": None,
    }

    updated_conversation: ConversationRecord = {
        **conversation,
        "currentRunId": analysis_run["runId"],
        "updatedAt": now,
    }
    run_created_event = build_run_created_event(run_id=analysis_run["runId"], occurred_at=now)
    _analysis_run_lifecycle_repository().create_run(
        analysis_run,
        updated_conversation,
        run_created_event,
    )
    return analysis_run


@router.get("/{runId}", response_model=AnalysisRunResponse, responses=FOUNDATION_ERROR_RESPONSE)
def get_analysis_run(run_id: str = Path(alias="runId")) -> AnalysisRunRecord | JSONResponse:
    """Load a persisted AnalysisRun by canonical runId."""

    try:
        return _analysis_run_repository().get_by_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )


@router.post(
    "/{runId}/dispatch",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def dispatch_analysis_run(run_id: str = Path(alias="runId")) -> AnalysisRunRecord | JSONResponse:
    """Advance a created/intake AnalysisRun to queued/queueing and create an ExecutionAttempt."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return lifecycle_service.dispatch(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )
    except AnalysisRunInvalidStateError as exc:
        return runtime_error_response(
            status_code=409,
            error_code="INVALID_STATE",
            message=str(exc),
        )


@router.get(
    "/{runId}/events",
    response_model=RunEventListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_events(run_id: str = Path(alias="runId")) -> dict[str, object] | JSONResponse:
    """Return persisted RunEvents for a real AnalysisRun ordered by sequence."""

    try:
        _analysis_run_repository().get_by_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _run_event_repository().list_by_run_id(run_id)}


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


@router.get(
    "/{runId}/source-evidence",
    response_model=SourceEvidenceListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_source_evidence(
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted SourceEvidence records for a real AnalysisRun."""

    try:
        _analysis_run_repository().get_by_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _source_evidence_repository().list_by_run_id(run_id)}


@router.get(
    "/{runId}/reports",
    response_model=ReportListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_reports(
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted Report records for a real AnalysisRun."""

    try:
        _analysis_run_repository().get_by_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _report_repository().list_by_run_id(run_id)}


@router.get(
    "/{runId}/decisions",
    response_model=DecisionListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_decisions(
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted Decision records for a real AnalysisRun."""

    try:
        _analysis_run_repository().get_by_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _decision_repository().list_by_run_id(run_id)}


@router.get(
    "/{runId}/execution-attempts",
    response_model=ExecutionAttemptListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_execution_attempts(run_id: str = Path(alias="runId")) -> dict[str, object] | JSONResponse:
    """Return persisted ExecutionAttempts for a real AnalysisRun."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return {"items": lifecycle_service.list_execution_attempts(run_id)}
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )


@router.get("/{runId}/approvals", responses=NOT_IMPLEMENTED_RESPONSE)
def list_approval_requests(run_id: str = Path(alias="runId")) -> JSONResponse:
    """Reserve the ApprovalRequest read boundary without faking approval state."""

    _ = run_id
    return not_implemented_route_stub_response()


@router.get(
    "/{runId}/conversation",
    response_model=ConversationResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def get_analysis_run_conversation(
    run_id: str = Path(alias="runId"),
) -> ConversationRecord | JSONResponse:
    """Resolve the current Conversation bound to a persisted AnalysisRun."""

    try:
        _analysis_run_repository().get_by_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    try:
        return _conversation_repository().get_by_current_run_id(run_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found for AnalysisRun: {run_id}",
        )


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
