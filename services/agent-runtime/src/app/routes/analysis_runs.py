"""AnalysisRun HTTP boundary for lifecycle-owned foundation APIs."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Path, status
from fastapi.responses import JSONResponse

from src.app.auth import (
    AuthenticatedRequestContext,
    authenticated_request_context_dependency,
)
from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    AnalysisRunResponse,
    ApprovalDecisionRequest,
    CancelAnalysisRunRequest,
    ConversationResponse,
    CreateAnalysisRunRequest,
    DecisionListResponse,
    DeliveryCompleteRequest,
    ExecutionAttemptListResponse,
    ExecutionAttemptResponse,
    ModelCallListResponse,
    ReportListResponse,
    RunEventListResponse,
    RuntimeRequestErrorResponse,
    RuntimeRouteStubErrorResponse,
    SourceEvidenceListResponse,
    ToolCallListResponse,
    WorkerClaimRequest,
    WorkerFailureRequest,
    WorkerHeartbeatRequest,
    WorkerLostRequest,
    WorkerReleaseRequest,
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
    ExecutionAttemptRecord,
    ExecutionAttemptRepository,
    MessageRepository,
    ModelCallRepository,
    ReportRepository,
    RunEventRepository,
    RuntimeFoundationPyMySqlDatabase,
    SourceEvidenceRepository,
    ToolCallRepository,
)
from src.modules.analysis_runs.delivery_service import AnalysisRunDeliveryService
from src.modules.analysis_runs.lifecycle_service import (
    AnalysisRunConversationNotFoundError,
    AnalysisRunInvalidStateError,
    AnalysisRunLifecycleService,
    build_run_created_event,
)

router = APIRouter(prefix="/analysis-runs", tags=["analysis-runs"])
AuthenticatedContext = Annotated[
    AuthenticatedRequestContext,
    Depends(authenticated_request_context_dependency),
]

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


def _tool_call_repository() -> ToolCallRepository:
    return ToolCallRepository(_runtime_foundation_database())


def _model_call_repository() -> ModelCallRepository:
    return ModelCallRepository(_runtime_foundation_database())


def _message_repository() -> MessageRepository:
    return MessageRepository(_runtime_foundation_database())


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
        conversation_repository=ConversationRepository(database),
        execution_attempt_repository=ExecutionAttemptRepository(database),
        run_event_repository=RunEventRepository(database),
        lifecycle_repository=AnalysisRunLifecycleRepository(database),
    )


def _analysis_run_delivery_service() -> AnalysisRunDeliveryService:
    database = _runtime_foundation_database()
    return AnalysisRunDeliveryService(
        analysis_run_repository=AnalysisRunRepository(database),
        analysis_task_repository=AnalysisTaskRepository(database),
        conversation_repository=ConversationRepository(database),
        lifecycle_repository=AnalysisRunLifecycleRepository(database),
        message_repository=MessageRepository(database),
        model_call_repository=ModelCallRepository(database),
        run_event_repository=RunEventRepository(database),
        tool_call_repository=ToolCallRepository(database),
    )


def _get_owned_run(run_id: str, context: AuthenticatedRequestContext) -> AnalysisRunRecord:
    return _analysis_run_repository().get_by_run_id_and_owner(
        run_id,
        workspace_id=context.workspaceId,
        user_id=context.userId,
    )


@router.post(
    "",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_201_CREATED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def create_analysis_run(
    request: CreateAnalysisRunRequest,
    context: AuthenticatedContext,
) -> AnalysisRunRecord | JSONResponse:
    """Create a real AnalysisRun and attach it to the Conversation resolved from AnalysisTask."""

    try:
        analysis_task = _analysis_task_repository().get_by_analysis_task_id_and_owner(
            request.analysisTaskId,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisTask not found: {request.analysisTaskId}",
        )

    try:
        conversation = _conversation_repository().get_by_conversation_id_and_owner(
            analysis_task["conversationId"],
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {analysis_task['conversationId']}",
        )

    now = utc_timestamp()
    analysis_run: AnalysisRunRecord = {
        "runId": generate_canonical_id("analysis-run"),
        "workspaceId": context.workspaceId,
        "userId": context.userId,
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
def get_analysis_run(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Load a persisted AnalysisRun by canonical runId."""

    try:
        return _get_owned_run(run_id, context)
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
def dispatch_analysis_run(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Advance a created/intake AnalysisRun to queued/queueing and create an ExecutionAttempt."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        _get_owned_run(run_id, context)
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
def list_analysis_run_events(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted RunEvents for a real AnalysisRun ordered by sequence."""

    try:
        _get_owned_run(run_id, context)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _run_event_repository().list_by_run_id(run_id)}


@router.get(
    "/{runId}/tool-calls",
    response_model=ToolCallListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_tool_calls(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted ToolCall records for a real AnalysisRun."""

    try:
        _get_owned_run(run_id, context)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _tool_call_repository().list_by_run_id(run_id)}


@router.get(
    "/{runId}/model-calls",
    response_model=ModelCallListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_model_calls(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted ModelCall records for a real AnalysisRun."""

    try:
        _get_owned_run(run_id, context)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    return {"items": _model_call_repository().list_by_run_id(run_id)}


@router.get(
    "/{runId}/source-evidence",
    response_model=SourceEvidenceListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_analysis_run_source_evidence(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted SourceEvidence records for a real AnalysisRun."""

    try:
        _get_owned_run(run_id, context)
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
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted Report records for a real AnalysisRun."""

    try:
        _get_owned_run(run_id, context)
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
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted Decision records for a real AnalysisRun."""

    try:
        _get_owned_run(run_id, context)
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
def list_execution_attempts(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted ExecutionAttempts for a real AnalysisRun."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        _get_owned_run(run_id, context)
        return {"items": lifecycle_service.list_execution_attempts(run_id)}
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )


@router.post(
    "/{runId}/worker-claim",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def claim_analysis_run(
    request: WorkerClaimRequest,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Advance a queued AnalysisRun into running/execution for the claimed worker."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return lifecycle_service.claim_for_execution(run_id, request.workerId)
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


@router.post(
    "/{runId}/worker-heartbeat",
    response_model=ExecutionAttemptResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def heartbeat_analysis_run(
    request: WorkerHeartbeatRequest,
    run_id: str = Path(alias="runId"),
) -> ExecutionAttemptRecord | JSONResponse:
    """Update heartbeatAt for the current running ExecutionAttempt."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return lifecycle_service.heartbeat(run_id, request.attemptId, request.workerId)
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


@router.post(
    "/{runId}/worker-failure",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def fail_analysis_run(
    request: WorkerFailureRequest,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Record a worker execution failure and push the run into failed."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return lifecycle_service.record_worker_failure(
            run_id,
            request.attemptId,
            request.workerId,
            request.failureCode,
            request.failureMessage,
        )
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


@router.post(
    "/{runId}/worker-lost",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def mark_analysis_run_worker_lost(
    request: WorkerLostRequest,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Record worker lease loss and push the run into expired."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return lifecycle_service.mark_worker_lost(
            run_id,
            request.attemptId,
            request.workerId,
            request.lostReason,
        )
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


@router.post(
    "/{runId}/worker-release",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def release_analysis_run_worker(
    request: WorkerReleaseRequest,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Release the current worker lease and move the run into delivery gate."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        return lifecycle_service.release_worker(run_id, request.attemptId, request.workerId)
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


@router.post(
    "/{runId}/delivery/complete",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def complete_analysis_run_delivery(
    request: DeliveryCompleteRequest,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Persist delivery artifacts from persisted execution state and complete the run."""

    delivery_service = _analysis_run_delivery_service()

    try:
        return delivery_service.complete_delivery(run_id, request.producerId)
    except AnalysisRunConversationNotFoundError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found for AnalysisRun: {run_id}",
        )
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


@router.get("/{runId}/approvals", responses=NOT_IMPLEMENTED_RESPONSE)
def list_approval_requests(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> JSONResponse:
    """Reserve the ApprovalRequest read boundary without faking approval state."""

    try:
        _get_owned_run(run_id, context)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )
    return not_implemented_route_stub_response()


@router.get(
    "/{runId}/conversation",
    response_model=ConversationResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def get_analysis_run_conversation(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> ConversationRecord | JSONResponse:
    """Resolve the current Conversation bound to a persisted AnalysisRun."""

    try:
        _get_owned_run(run_id, context)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )

    try:
        return _conversation_repository().get_by_current_run_id_and_owner(
            run_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found for AnalysisRun: {run_id}",
        )


@router.post(
    "/{runId}/cancel",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def cancel_analysis_run(
    request: CancelAnalysisRunRequest,
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Cancel a queued/running/waiting AnalysisRun without faking delivery side effects."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        _get_owned_run(run_id, context)
        return lifecycle_service.cancel_analysis_run(run_id, request.reason)
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


@router.post(
    "/{runId}/retry",
    response_model=AnalysisRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def retry_analysis_run(
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
) -> AnalysisRunRecord | JSONResponse:
    """Create a new retry AnalysisRun from an allowed terminal source run."""

    lifecycle_service = _analysis_run_lifecycle_service()

    try:
        _get_owned_run(run_id, context)
        return lifecycle_service.retry_analysis_run(run_id)
    except AnalysisRunConversationNotFoundError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found for AnalysisRun: {run_id}",
        )
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


@router.post("/{runId}/approvals/{approvalId}/decision", responses=NOT_IMPLEMENTED_RESPONSE)
def decide_approval_request(
    _request: ApprovalDecisionRequest,
    context: AuthenticatedContext,
    run_id: str = Path(alias="runId"),
    approval_id: str = Path(alias="approvalId"),
) -> JSONResponse:
    """Reserve the approval decision boundary without performing a real workflow transition."""

    try:
        _get_owned_run(run_id, context)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisRun not found: {run_id}",
        )
    _ = approval_id
    return not_implemented_route_stub_response()
