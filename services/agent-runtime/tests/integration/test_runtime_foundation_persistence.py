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
    MessageRecord,
    MessageRepository,
    MessageStreamRecord,
    MessageStreamRepository,
    ModelCallRecord,
    ModelCallRepository,
    ReportRecord,
    ReportRepository,
    ReportSectionRecord,
    RuntimeFoundationMysqlCli,
    SourceEvidenceRecord,
    SourceEvidenceRepository,
    ToolCallRecord,
    ToolCallRepository,
)

REPO_ROOT = Path(__file__).resolve().parents[4]
RUNTIME_FOUNDATION_SCRIPT = REPO_ROOT / "scripts/migration/runtime_foundation.sh"

ANALYSIS_TASK_ID = "analysis-task-revenue-gap-q2"
CONVERSATION_ID = "conversation-revenue-gap-q2"
RUN_ID = "analysis-q2-revenue-gap"


def run_runtime_foundation_command(
    *args: str, check: bool = True, input_text: str | None = None
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [str(RUNTIME_FOUNDATION_SCRIPT), *args],
        cwd=REPO_ROOT,
        input=input_text,
        text=True,
        capture_output=True,
        check=check,
        env=os.environ.copy(),
    )


def build_analysis_task() -> AnalysisTaskRecord:
    context_pack: AnalysisTaskContextPack = {
        "version": 1,
        "suggestedPrompt": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "traceability": "direct_refs",
        "capturedAt": "2026-06-05T11:08:12+08:00",
        "root": {
            "nodeId": "inspector-node-task-context-root",
            "kind": "dashboardOverview",
            "role": "inputContext",
            "owner": {
                "type": "analysisTask",
                "analysisTaskId": ANALYSIS_TASK_ID,
            },
            "title": "经营状态总览",
            "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
            "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
            "timeRange": {"key": "this_quarter", "label": "2026 Q2"},
            "capturedAt": "2026-06-05T11:08:12+08:00",
            "children": [
                {
                    "nodeId": "inspector-node-task-context-metric",
                    "kind": "metric",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask",
                        "analysisTaskId": ANALYSIS_TASK_ID,
                    },
                    "title": "确认收入",
                    "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
                    "value": "收入增速 < -2%",
                    "sourceRef": {
                        "type": "metric",
                        "metricId": "metric-recognized-revenue",
                    },
                }
            ],
        },
    }

    return {
        "analysisTaskId": ANALYSIS_TASK_ID,
        "conversationId": CONVERSATION_ID,
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


def build_tool_call_record() -> ToolCallRecord:
    return {
        "toolCallId": "tool-call-analysis-q2-revenue-gap-metrics",
        "runId": RUN_ID,
        "toolName": "metrics.summary.compare",
        "input": {"request": "metrics.summary.compare"},
        "output": {"conclusion": "华东渠道确认延迟明显。"},
        "status": "succeeded",
        "riskLevel": "medium",
        "permission": "metrics.read",
        "errorType": None,
        "errorMessage": None,
        "startedAt": "2026-06-05T11:14:00+08:00",
        "completedAt": "2026-06-05T11:16:00+08:00",
    }


def build_model_call_record() -> ModelCallRecord:
    return {
        "modelCallId": "model-call-analysis-q2-revenue-gap-summary",
        "runId": RUN_ID,
        "provider": "openai",
        "modelId": "gpt-4.1-static",
        "promptVersionId": "prompt-revenue-gap-v1",
        "inputTokens": 6120,
        "outputTokens": 6360,
        "cost": 0.86,
        "latencyMs": 18200,
        "status": "succeeded",
        "errorType": None,
        "errorMessage": None,
        "startedAt": "2026-06-05T11:20:00+08:00",
        "completedAt": "2026-06-05T11:22:00+08:00",
    }


def build_message_records() -> list[MessageRecord]:
    return [
        {
            "messageId": "message-revenue-gap-q2-user",
            "conversationId": CONVERSATION_ID,
            "analysisTaskId": ANALYSIS_TASK_ID,
            "turnId": "turn-revenue-gap-q2-1",
            "runId": RUN_ID,
            "role": "user",
            "content": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
            "status": "completed",
            "sourceEvidenceIds": [],
            "toolCallIds": [],
            "reportId": None,
            "createdAt": "2026-06-05T11:08:12+08:00",
            "completedAt": "2026-06-05T11:08:12+08:00",
        },
        {
            "messageId": "message-revenue-gap-q2-assistant",
            "conversationId": CONVERSATION_ID,
            "analysisTaskId": ANALYSIS_TASK_ID,
            "turnId": "turn-revenue-gap-q2-1",
            "runId": RUN_ID,
            "role": "assistant",
            "content": (
                "收入增速下滑主要来自华东核心渠道确认延迟与促销库存错配，"
                "而不是整体价格体系失效。"
            ),
            "status": "completed",
            "sourceEvidenceIds": [
                "source-evidence-channel-weekly-17",
                "source-evidence-inventory-note-east-04",
            ],
            "toolCallIds": ["tool-call-analysis-q2-revenue-gap-metrics"],
            "reportId": "report-revenue-gap-q2",
            "createdAt": "2026-06-05T11:22:00+08:00",
            "completedAt": "2026-06-05T11:22:00+08:00",
        },
    ]


def build_message_stream_records() -> list[MessageStreamRecord]:
    return [
        {
            "messageStreamId": "message-stream-revenue-gap-q2-0",
            "conversationId": CONVERSATION_ID,
            "messageId": "message-revenue-gap-q2-assistant",
            "runId": RUN_ID,
            "sequence": 0,
            "eventType": "stream.started",
            "delta": "",
            "status": "created",
            "occurredAt": "2026-06-05T11:22:00+08:00",
            "errorCode": None,
            "errorMessage": None,
        },
        {
            "messageStreamId": "message-stream-revenue-gap-q2-1",
            "conversationId": CONVERSATION_ID,
            "messageId": "message-revenue-gap-q2-assistant",
            "runId": RUN_ID,
            "sequence": 1,
            "eventType": "stream.delta",
            "delta": "收入增速下滑主要来自华东核心渠道确认延迟",
            "status": "streaming",
            "occurredAt": "2026-06-05T11:23:00+08:00",
            "errorCode": None,
            "errorMessage": None,
        },
        {
            "messageStreamId": "message-stream-revenue-gap-q2-2",
            "conversationId": CONVERSATION_ID,
            "messageId": "message-revenue-gap-q2-assistant",
            "runId": RUN_ID,
            "sequence": 2,
            "eventType": "stream.completed",
            "delta": "与促销库存错配。",
            "status": "completed",
            "occurredAt": "2026-06-05T11:24:00+08:00",
            "errorCode": None,
            "errorMessage": None,
        },
    ]


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
    tool_call_repository = ToolCallRepository(database)
    model_call_repository = ModelCallRepository(database)
    source_evidence_repository = SourceEvidenceRepository(database)
    report_repository = ReportRepository(database)
    decision_repository = DecisionRepository(database)
    message_repository = MessageRepository(database)
    message_stream_repository = MessageStreamRepository(database)

    analysis_task_repository.create(build_analysis_task())
    conversation_repository.create(build_conversation())
    analysis_run_repository.create(build_analysis_run())

    source_evidence_records = build_source_evidence_records()
    for source_evidence in source_evidence_records:
        source_evidence_repository.create(source_evidence)

    tool_call_record = build_tool_call_record()
    model_call_record = build_model_call_record()
    report_record = build_report_record()
    decision_record = build_decision_record()
    message_records = build_message_records()
    message_stream_records = build_message_stream_records()

    tool_call_repository.create(tool_call_record)
    model_call_repository.create(model_call_record)
    report_repository.create(report_record)
    decision_repository.create(decision_record)
    for message in message_records:
        message_repository.create(message)
    for message_stream in message_stream_records:
        message_stream_repository.create(message_stream)

    assert tool_call_repository.list_by_run_id(RUN_ID) == [tool_call_record]
    assert model_call_repository.list_by_run_id(RUN_ID) == [model_call_record]
    assert source_evidence_repository.list_by_run_id(RUN_ID) == source_evidence_records
    assert report_repository.list_by_run_id(RUN_ID) == [report_record]
    assert decision_repository.list_by_run_id(RUN_ID) == [decision_record]
    assert message_repository.list_by_conversation_id(CONVERSATION_ID) == message_records
    assert message_stream_repository.list_by_message_id("message-revenue-gap-q2-assistant") == (
        message_stream_records
    )


def test_runtime_foundation_seed_and_query_verify(runtime_foundation_env: None) -> None:
    seed_result = run_runtime_foundation_command("seed")
    assert seed_result.returncode == 0, seed_result.stderr

    extra_session_result = run_runtime_foundation_command(
        "exec-sql",
        input_text="""
INSERT INTO auth_sessions (
  auth_session_id,
  user_id,
  current_workspace_id,
  session_token_hash,
  expires_at,
  created_at,
  updated_at,
  last_accessed_at,
  revoked_at
) VALUES (
  'auth-session-user-zoe-sea-extra',
  'user-zoe',
  'workspace-northstar-retail-sea',
  'e5ff6ea34f7cdb6edf1f7bc3c2fa56a2244887f0d5d618c0db6d76b8f9fbe5e2',
  '2099-01-01T00:00:00Z',
  '2026-06-14T10:00:00Z',
  '2026-06-14T10:00:00Z',
  '2026-06-14T10:00:00Z',
  NULL
);
""",
    )
    assert extra_session_result.returncode == 0, extra_session_result.stderr

    verify_result = run_runtime_foundation_command("query-verify")
    assert verify_result.returncode == 0, verify_result.stderr
    assert "users.row_count=1" in verify_result.stdout
    assert "workspaces.row_count=2" in verify_result.stdout
    assert "workspace_memberships.row_count=2" in verify_result.stdout
    assert "metrics.china.row_count=4" in verify_result.stdout
    assert "metrics.sea.row_count=2" in verify_result.stdout
    assert "metric_context_sources.row_count=12" in verify_result.stdout
    assert "auth_sessions.seedUser.exists=1" in verify_result.stdout
    assert "auth_sessions.validSeedUserSession.exists=1" in verify_result.stdout
    assert "user.userId=user-zoe" in verify_result.stdout
    assert "workspace.primary.workspaceId=workspace-northstar-retail-china" in verify_result.stdout
    assert "workspace.secondary.workspaceId=workspace-northstar-retail-sea" in verify_result.stdout
    assert "membership.primary.role=analyst" in verify_result.stdout
    assert "membership.secondary.role=viewer" in verify_result.stdout
    assert "analysis-task-revenue-gap-q2" in verify_result.stdout
    assert "conversation-revenue-gap-q2" in verify_result.stdout
    assert "analysis-q2-revenue-gap" in verify_result.stdout
    assert "business-domain-revenue-quality" in verify_result.stdout
    assert "metric.recognizedRevenue.exists=1" in verify_result.stdout
    assert "metric.grossMargin.exists=1" in verify_result.stdout
    assert "metric.refundRate.exists=1" in verify_result.stdout
    assert "metric.inventoryTurnover.exists=1" in verify_result.stdout
    assert "metric.seaRecognizedRevenue.exists=1" in verify_result.stdout
    assert "metric.seaDeliveryDelayRate.exists=1" in verify_result.stdout
    assert "metricContextSources.recognizedRevenue.exists=1" in verify_result.stdout
    assert "metricContextSources.seaDeliveryDelay.exists=1" in verify_result.stdout
    assert "analysisTask.contextPack.root.kind=dashboardOverview" in verify_result.stdout
    assert "analysisTask.contextPack.reportId=report-weekly-business" in verify_result.stdout
    assert "tables=19" in verify_result.stdout
    assert "execution_attempts.row_count=0" in verify_result.stdout
    assert "run_events.row_count=0" in verify_result.stdout
    assert "tool_calls.row_count=0" in verify_result.stdout
    assert "model_calls.row_count=0" in verify_result.stdout
    assert "source_evidence.row_count=0" in verify_result.stdout
    assert "reports.row_count=0" in verify_result.stdout
    assert "report_sections.row_count=0" in verify_result.stdout
    assert "decisions.row_count=0" in verify_result.stdout
    assert "messages.row_count=0" in verify_result.stdout
    assert "message_streams.row_count=0" in verify_result.stdout
    assert "status=created" in verify_result.stdout
    assert "phase=intake" in verify_result.stdout
    execution_attempt_repository = ExecutionAttemptRepository(RuntimeFoundationMysqlCli())
    assert execution_attempt_repository.list_by_run_id(RUN_ID) == []


def test_identity_workspace_foundation_seeded_records_are_queryable(
    runtime_foundation_env: None,
) -> None:
    seed_result = run_runtime_foundation_command("seed")
    assert seed_result.returncode == 0, seed_result.stderr

    from src.infrastructure.database.runtime_foundation import (
        AuthSessionRepository,
        CurrentWorkspaceContextRepository,
        RuntimeFoundationMysqlCli,
        UserRepository,
        WorkspaceMembershipRepository,
        WorkspaceRepository,
    )

    database = RuntimeFoundationMysqlCli()
    user_repository = UserRepository(database)
    workspace_repository = WorkspaceRepository(database)
    workspace_membership_repository = WorkspaceMembershipRepository(database)
    auth_session_repository = AuthSessionRepository(database)
    current_workspace_context_repository = CurrentWorkspaceContextRepository(database)

    assert user_repository.get_by_user_id("user-zoe") == {
        "userId": "user-zoe",
        "email": "zoe@northstar.example.com",
        "displayName": "Zoe",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }
    assert workspace_repository.get_by_workspace_id("workspace-northstar-retail-china") == {
        "workspaceId": "workspace-northstar-retail-china",
        "name": "Northstar Retail China",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }
    assert workspace_repository.get_by_workspace_id("workspace-northstar-retail-sea") == {
        "workspaceId": "workspace-northstar-retail-sea",
        "name": "Northstar Retail SEA",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }
    assert workspace_membership_repository.list_by_user_id("user-zoe") == [
        {
            "membershipId": "membership-user-zoe-northstar-retail-china",
            "userId": "user-zoe",
            "workspaceId": "workspace-northstar-retail-china",
            "role": "analyst",
            "createdAt": "2026-06-05T11:08:12+08:00",
            "updatedAt": "2026-06-05T11:08:12+08:00",
        },
        {
            "membershipId": "membership-user-zoe-northstar-retail-sea",
            "userId": "user-zoe",
            "workspaceId": "workspace-northstar-retail-sea",
            "role": "viewer",
            "createdAt": "2026-06-05T11:08:12+08:00",
            "updatedAt": "2026-06-05T11:08:12+08:00",
        },
    ]
    assert auth_session_repository.get_by_auth_session_id("auth-session-user-zoe-china") == {
        "authSessionId": "auth-session-user-zoe-china",
        "userId": "user-zoe",
        "currentWorkspaceId": "workspace-northstar-retail-china",
        "expiresAt": "2026-07-15T11:08:12+08:00",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
        "lastAccessedAt": "2026-06-05T11:08:12+08:00",
    }
    assert current_workspace_context_repository.get_by_auth_session_id(
        "auth-session-user-zoe-china"
    ) == {
        "membershipId": "membership-user-zoe-northstar-retail-china",
        "userId": "user-zoe",
        "workspaceId": "workspace-northstar-retail-china",
        "role": "analyst",
    }

    password_row = database.query_json_object(
        """
SELECT JSON_OBJECT(
  'passwordHash', password_hash
)
FROM users
WHERE user_id = 'user-zoe'
LIMIT 1;
"""
    )
    assert password_row == {
        "passwordHash": (
            "pbkdf2_sha256$600000$seed-zoe-salt$"
            "7c7b38dc1ada2333ddd8a68c6cece3b1a435180355abbbcd0a5fc3b14ae036d2"
        )
    }


def test_runtime_foundation_query_verify_fails_without_seed(runtime_foundation_env: None) -> None:
    verify_result = run_runtime_foundation_command("query-verify", check=False)
    assert verify_result.returncode != 0
    assert "Missing expected query verify line: analysis_tasks.row_count=1" in verify_result.stderr
