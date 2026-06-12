"""AnalysisTask HTTP boundary for real runtime foundation success paths."""

from typing import Any, cast

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

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
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRepository,
    RuntimeFoundationPyMySqlDatabase,
)
from src.modules.conversations.analysis_service import (
    AnalysisDraftConversationMismatchError,
    AnalysisSubmitService,
    SubmitAnalysisDraftCommand,
)

router = APIRouter(prefix="/analysis-tasks", tags=["analysis-tasks"])

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
def create_analysis_task(request: CreateAnalysisTaskRequest) -> AnalysisTaskRecord | JSONResponse:
    """Create the formal AnalysisTask input object through the MySQL repository."""

    try:
        conversation = ConversationRepository(_runtime_foundation_database()).get_by_conversation_id(
            request.conversationId
        )
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {error.args[0]}",
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

    now = utc_timestamp()
    analysis_task: AnalysisTaskRecord = {
        "analysisTaskId": generate_canonical_id("analysis-task"),
        "conversationId": request.conversationId,
        "workspaceId": request.workspaceId,
        "userId": request.userId,
        "businessDomainId": request.businessDomainId,
        "question": request.question,
        "contextPack": cast(AnalysisTaskContextPack, request.contextPack.model_dump())
        if request.contextPack is not None
        else None,
        "createdAt": now,
        "updatedAt": now,
    }
    _analysis_task_repository().create(analysis_task)
    return analysis_task


@router.post(
    "/submit",
    response_model=SubmitAnalysisDraftResponse,
    status_code=status.HTTP_201_CREATED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def submit_analysis_draft(
    request: SubmitAnalysisDraftRequest,
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
                userId=request.userId,
                workspaceId=request.workspaceId,
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

    return SubmitAnalysisDraftResponse(
        conversation=result.conversation,
        analysisTask=result.analysisTask,
        analysisRun=result.analysisRun,
        userMessage=result.userMessage,
    )
