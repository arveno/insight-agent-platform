from __future__ import annotations

import os
import subprocess
from pathlib import Path

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    DecisionRecord,
    DecisionRepository,
    ExecutionAttemptRepository,
    GoldenPathFoundationRepository,
    ReportRecord,
    ReportRepository,
    ReportSectionRecord,
    RuntimeFoundationMysqlCli,
    SourceEvidenceRecord,
    SourceEvidenceRepository,
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


def build_source_evidence_records() -> list[SourceEvidenceRecord]:
    return [
        {
            "sourceEvidenceId": "source-evidence-channel-weekly-17",
            "runId": RUN_ID,
            "sourceType": "knowledge_document",
            "sourceId": "knowledge-document-channel-weekly-17",
            "title": "渠道周报第 17 期",
            "snippet": "华东渠道存在确认延迟，影响 2026 Q2 收入确认节奏。",
            "metadata": {"displayCategory": "weekly_digest"},
            "confidence": 0.86,
            "createdAt": "2026-06-05T11:23:00+08:00",
        },
        {
            "sourceEvidenceId": "source-evidence-inventory-note-east-04",
            "runId": RUN_ID,
            "sourceType": "knowledge_document",
            "sourceId": "knowledge-document-inventory-east-04",
            "title": "华东库存复核记录",
            "snippet": "促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
            "metadata": {"displayCategory": "inventory_note"},
            "confidence": 0.82,
            "createdAt": "2026-06-05T11:24:00+08:00",
        },
    ]


def build_report_record() -> ReportRecord:
    report_section: ReportSectionRecord = {
        "reportSectionId": "report-revenue-gap-q2-section-next-step",
        "reportId": "report-revenue-gap-q2",
        "title": "下一步动作",
        "content": "先核对渠道确认周期，再复核促销库存错配。",
        "createdAt": "2026-06-05T11:25:00+08:00",
    }
    return {
        "reportId": "report-revenue-gap-q2",
        "runId": RUN_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "title": "收入异常分析摘要",
        "summary": "形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作。",
        "sections": [report_section],
        "sourceEvidence": [
            "source-evidence-channel-weekly-17",
            "source-evidence-inventory-note-east-04",
        ],
        "createdAt": "2026-06-05T11:25:00+08:00",
    }


def build_decision_record() -> DecisionRecord:
    return {
        "decisionId": "decision-revenue-gap-q2",
        "workspaceId": "workspace-northstar-retail-china",
        "runId": RUN_ID,
        "reportId": "report-revenue-gap-q2",
        "title": "复核华东渠道确认周期与促销库存错配",
        "status": "proposed",
        "createdAt": "2026-06-05T11:26:00+08:00",
    }


def test_runtime_foundation_env_provides_migrated_schema(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    analysis_task_count = database.query_json_object(
        "SELECT JSON_OBJECT('count', COUNT(*)) FROM analysis_tasks;"
    )

    assert analysis_task_count == {"count": 0}


def test_runtime_foundation_repositories_round_trip_frozen_chain(
    runtime_foundation_env: None,
) -> None:
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


def test_runtime_artifact_repositories_round_trip(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    analysis_task_repository = AnalysisTaskRepository(database)
    conversation_repository = ConversationRepository(database)
    analysis_run_repository = AnalysisRunRepository(database)
    source_evidence_repository = SourceEvidenceRepository(database)
    report_repository = ReportRepository(database)
    decision_repository = DecisionRepository(database)

    analysis_task_repository.create(build_analysis_task())
    conversation_repository.create(build_conversation())
    analysis_run_repository.create(build_analysis_run())

    source_evidence_records = build_source_evidence_records()
    for source_evidence in source_evidence_records:
        source_evidence_repository.create(source_evidence)

    report_record = build_report_record()
    decision_record = build_decision_record()
    report_repository.create(report_record)
    decision_repository.create(decision_record)

    assert source_evidence_repository.list_by_run_id(RUN_ID) == source_evidence_records
    assert report_repository.list_by_run_id(RUN_ID) == [report_record]
    assert decision_repository.list_by_run_id(RUN_ID) == [decision_record]


def test_runtime_foundation_seed_and_query_verify(runtime_foundation_env: None) -> None:
    seed_result = run_runtime_foundation_command("seed")
    assert seed_result.returncode == 0, seed_result.stderr

    verify_result = run_runtime_foundation_command("query-verify")
    assert verify_result.returncode == 0, verify_result.stderr
    assert "analysis-task-revenue-gap-q2" in verify_result.stdout
    assert "conversation-revenue-gap-q2" in verify_result.stdout
    assert "analysis-q2-revenue-gap" in verify_result.stdout
    assert "business-domain-revenue-quality" in verify_result.stdout
    assert "metric-recognized-revenue" in verify_result.stdout
    assert "tables=9" in verify_result.stdout
    assert "execution_attempts.row_count=0" in verify_result.stdout
    assert "run_events.row_count=0" in verify_result.stdout
    assert "source_evidence.row_count=0" in verify_result.stdout
    assert "reports.row_count=0" in verify_result.stdout
    assert "report_sections.row_count=0" in verify_result.stdout
    assert "decisions.row_count=0" in verify_result.stdout
    assert "status=created" in verify_result.stdout
    assert "phase=intake" in verify_result.stdout
    execution_attempt_repository = ExecutionAttemptRepository(RuntimeFoundationMysqlCli())
    assert execution_attempt_repository.list_by_run_id(RUN_ID) == []


def test_runtime_foundation_query_verify_fails_without_seed(runtime_foundation_env: None) -> None:
    verify_result = run_runtime_foundation_command("query-verify", check=False)
    assert verify_result.returncode != 0
    assert "Missing expected query verify line: analysis_tasks.row_count=1" in verify_result.stderr
