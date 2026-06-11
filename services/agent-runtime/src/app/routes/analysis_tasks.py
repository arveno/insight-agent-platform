"""AnalysisTask HTTP boundary for real runtime foundation success paths."""

from typing import cast

from fastapi import APIRouter, status

from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    AnalysisTaskResponse,
    CreateAnalysisTaskRequest,
    generate_canonical_id,
    utc_timestamp,
)
from src.infrastructure.database.runtime_foundation import (
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    RuntimeFoundationPyMySqlDatabase,
)

router = APIRouter(prefix="/analysis-tasks", tags=["analysis-tasks"])


def _analysis_task_repository() -> AnalysisTaskRepository:
    settings = get_settings()
    database = RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )
    return AnalysisTaskRepository(database)


@router.post("", response_model=AnalysisTaskResponse, status_code=status.HTTP_201_CREATED)
def create_analysis_task(request: CreateAnalysisTaskRequest) -> AnalysisTaskRecord:
    """Create the formal AnalysisTask input object through the MySQL repository."""

    now = utc_timestamp()
    analysis_task: AnalysisTaskRecord = {
        "analysisTaskId": generate_canonical_id("analysis-task"),
        "workspaceId": request.workspaceId,
        "userId": request.userId,
        "businessDomainId": request.businessDomainId,
        "question": request.question,
        "contextPack": cast(AnalysisTaskContextPack, request.contextPack.model_dump()),
        "createdAt": now,
        "updatedAt": now,
    }
    _analysis_task_repository().create(analysis_task)
    return analysis_task
