"""AnalysisTask HTTP boundary for real runtime foundation success paths."""

from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from src.app.auth import (
    AuthenticatedRequestContext,
    authenticated_request_context_dependency,
)
from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    AnalysisTaskResponse,
    CreateAnalysisTaskRequest,
    RuntimeRequestErrorResponse,
    SubmitAnalysisDraftRequest,
    SubmitAnalysisDraftResponse,
    generate_canonical_id,
    runtime_error_response,
    utc_timestamp,
)
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRepository,
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRepository,
    RuntimeFoundationPyMySqlDatabase,
)
from src.modules.conversations.analysis_service import (
    AnalysisDraftConversationMismatchError,
    AnalysisSubmitService,
    ConversationBusyError,
    SubmitAnalysisDraftCommand,
    bind_analysis_task_context_pack,
)

router = APIRouter(prefix="/analysis-tasks", tags=["analysis-tasks"])
AuthenticatedContext = Annotated[
    AuthenticatedRequestContext,
    Depends(authenticated_request_context_dependency),
]

FOUNDATION_ERROR_RESPONSE: dict[int | str, dict[str, Any]] = {
    404: {
        "description": "Requested runtime foundation object was not found.",
        "model": RuntimeRequestErrorResponse,
    },
    409: {
        "description": "Request chain mismatched the persisted runtime foundation objects.",
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


def _submit_service() -> AnalysisSubmitService:
    database = _runtime_foundation_database()
    return AnalysisSubmitService(
        analysis_run_repository=AnalysisRunRepository(database),
        analysis_task_repository=AnalysisTaskRepository(database),
        conversation_repository=ConversationRepository(database),
        lifecycle_repository=AnalysisRunLifecycleRepository(database),
    )


@router.post(
    "",
    response_model=AnalysisTaskResponse,
    status_code=status.HTTP_201_CREATED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def create_analysis_task(
    request: CreateAnalysisTaskRequest,
    context: AuthenticatedContext,
) -> AnalysisTaskRecord | JSONResponse:
    """Create the formal AnalysisTask input object through the MySQL repository."""

    try:
        ConversationRepository(_runtime_foundation_database()).get_by_conversation_id_and_owner(
            request.conversationId,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {error.args[0]}",
        )

    now = utc_timestamp()
    analysis_task_id = generate_canonical_id("analysis-task")
    analysis_task: AnalysisTaskRecord = {
        "analysisTaskId": analysis_task_id,
        "conversationId": request.conversationId,
        "workspaceId": context.workspaceId,
        "userId": context.userId,
        "businessDomainId": request.businessDomainId,
        "question": request.question,
        "contextPack": bind_analysis_task_context_pack(
            cast(AnalysisTaskContextPack, request.contextPack.model_dump())
            if request.contextPack is not None
            else None,
            analysis_task_id,
        ),
        "createdAt": now,
        "updatedAt": now,
    }
    _analysis_task_repository().create(analysis_task)
    return analysis_task


@router.get(
    "/{analysisTaskId}",
    response_model=AnalysisTaskResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def get_analysis_task(
    analysisTaskId: str,
    context: AuthenticatedContext,
) -> AnalysisTaskRecord | JSONResponse:
    """Read one persisted AnalysisTask including its immutable context snapshot."""

    try:
        return _analysis_task_repository().get_by_analysis_task_id_and_owner(
            analysisTaskId,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisTask not found: {error.args[0]}",
        )


@router.post(
    "/submit",
    response_model=SubmitAnalysisDraftResponse,
    status_code=status.HTTP_201_CREATED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def submit_analysis_draft(
    request: SubmitAnalysisDraftRequest,
    context: AuthenticatedContext,
) -> SubmitAnalysisDraftResponse | JSONResponse:
    """Submit Analysis draft through the canonical single-track orchestration entry."""

    try:
        result = _submit_service().submit_draft(
            SubmitAnalysisDraftCommand(
                businessDomainId=request.businessDomainId,
                contextPack=cast(AnalysisTaskContextPack, request.contextPack.model_dump())
                if request.contextPack is not None
                else None,
                conversationId=request.conversationId,
                question=request.question,
                title=request.title,
                userId=context.userId,
                workspaceId=context.workspaceId,
            )
        )
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {error.args[0]}",
        )
    except AnalysisDraftConversationMismatchError as error:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message=str(error),
        )
    except ConversationBusyError as error:
        return runtime_error_response(
            status_code=409,
            error_code="CONVERSATION_BUSY",
            message=str(error),
        )

    return SubmitAnalysisDraftResponse(
        conversation=result.conversation,
        analysisTask=result.analysisTask,
        analysisRun=result.analysisRun,
        userMessage=result.userMessage,
    )
