from __future__ import annotations

import os
import subprocess
import uuid
from collections.abc import Iterator
from pathlib import Path

import pytest
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    ExecutionAttemptRepository,
    GoldenPathFoundationRepository,
    RuntimeFoundationMysqlCli,
)

REPO_ROOT = Path(__file__).resolve().parents[4]
RUNTIME_FOUNDATION_SCRIPT = REPO_ROOT / "scripts/migration/runtime_foundation.sh"

ANALYSIS_TASK_ID = "analysis-task-revenue-gap-q2"
CONVERSATION_ID = "conversation-revenue-gap-q2"
RUN_ID = "analysis-q2-revenue-gap"


def run_runtime_foundation_command(
    *args: str, check: bool = True
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [str(RUNTIME_FOUNDATION_SCRIPT), *args],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        check=check,
        env=os.environ.copy(),
    )


@pytest.fixture()
def runtime_foundation_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    project_suffix = uuid.uuid4().hex[:8]

    monkeypatch.setenv("IAP_MIGRATION_TARGET", "local")
    monkeypatch.setenv(
        "IAP_MIGRATION_COMPOSE_PROJECT_NAME", f"iap-runtime-foundation-{project_suffix}"
    )
    monkeypatch.setenv("IAP_MIGRATION_DATA_DIR", str(tmp_path / "mysql-data"))

    try:
        yield
    finally:
        run_runtime_foundation_command("down", check=False)


def build_analysis_task() -> AnalysisTaskRecord:
    context_pack: AnalysisTaskContextPack = {
        "metricId": "metric-recognized-revenue",
        "timeRange": "2026 Q2",
        "threshold": "收入增速 < -2%",
        "trend": "华东区域收入增速低于阈值",
        "tableIds": ["table-sales-order", "table-refund-order"],
        "knowledgeDocumentIds": [
            "knowledge-document-channel-weekly-17",
            "knowledge-document-inventory-east-04",
        ],
    }

    return {
        "analysisTaskId": ANALYSIS_TASK_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "userId": "user-zoe",
        "businessDomainId": "business-domain-revenue-quality",
        "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "contextPack": context_pack,
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }


def build_conversation() -> ConversationRecord:
    return {
        "conversationId": CONVERSATION_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "userId": "user-zoe",
        "analysisTaskId": ANALYSIS_TASK_ID,
        "currentRunId": RUN_ID,
        "title": "收入增速异常",
        "status": "active",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }


def build_analysis_run() -> AnalysisRunRecord:
    return {
        "runId": RUN_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "userId": "user-zoe",
        "analysisTaskId": ANALYSIS_TASK_ID,
        "status": "created",
        "phase": "intake",
        "outcome": None,
        "waitingFor": None,
        "createdAt": "2026-06-05T11:08:12+08:00",
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
        "retryable": None,
        "retryOfRunId": None,
        "originalRunId": None,
    }


def test_runtime_foundation_repositories_round_trip_frozen_chain(
    runtime_foundation_env: None,
) -> None:
    migrate_result = run_runtime_foundation_command("migrate")
    assert migrate_result.returncode == 0, migrate_result.stderr

    database = RuntimeFoundationMysqlCli()
    analysis_task_repository = AnalysisTaskRepository(database)
    conversation_repository = ConversationRepository(database)
    analysis_run_repository = AnalysisRunRepository(database)
    execution_attempt_repository = ExecutionAttemptRepository(database)
    foundation_repository = GoldenPathFoundationRepository(
        analysis_task_repository=analysis_task_repository,
        conversation_repository=conversation_repository,
        analysis_run_repository=analysis_run_repository,
    )

    analysis_task = build_analysis_task()
    conversation = build_conversation()
    analysis_run = build_analysis_run()

    analysis_task_repository.create(analysis_task)
    conversation_repository.create(conversation)
    analysis_run_repository.create(analysis_run)

    assert analysis_task_repository.get_by_analysis_task_id(ANALYSIS_TASK_ID) == analysis_task
    assert conversation_repository.get_by_conversation_id(CONVERSATION_ID) == conversation
    assert analysis_run_repository.get_by_run_id(RUN_ID) == analysis_run
    assert execution_attempt_repository.list_by_run_id(RUN_ID) == []

    foundation = foundation_repository.get_by_analysis_task_id(ANALYSIS_TASK_ID)

    assert foundation["analysisTask"] == analysis_task
    assert foundation["conversation"] == conversation
    assert foundation["analysisRun"] == analysis_run


def test_runtime_foundation_seed_and_query_verify(runtime_foundation_env: None) -> None:
    migrate_result = run_runtime_foundation_command("migrate")
    assert migrate_result.returncode == 0, migrate_result.stderr

    seed_result = run_runtime_foundation_command("seed")
    assert seed_result.returncode == 0, seed_result.stderr

    verify_result = run_runtime_foundation_command("query-verify")
    assert verify_result.returncode == 0, verify_result.stderr
    assert "analysis-task-revenue-gap-q2" in verify_result.stdout
    assert "conversation-revenue-gap-q2" in verify_result.stdout
    assert "analysis-q2-revenue-gap" in verify_result.stdout
    assert "business-domain-revenue-quality" in verify_result.stdout
    assert "metric-recognized-revenue" in verify_result.stdout
    assert "tables=4" in verify_result.stdout
    assert "execution_attempts.row_count=0" in verify_result.stdout
    assert "status=created" in verify_result.stdout
    assert "phase=intake" in verify_result.stdout
    execution_attempt_repository = ExecutionAttemptRepository(RuntimeFoundationMysqlCli())
    assert execution_attempt_repository.list_by_run_id(RUN_ID) == []


def test_runtime_foundation_query_verify_fails_without_seed(runtime_foundation_env: None) -> None:
    migrate_result = run_runtime_foundation_command("migrate")
    assert migrate_result.returncode == 0, migrate_result.stderr

    verify_result = run_runtime_foundation_command("query-verify", check=False)
    assert verify_result.returncode != 0
    assert "Missing expected query verify line: analysis_tasks.row_count=1" in verify_result.stderr
