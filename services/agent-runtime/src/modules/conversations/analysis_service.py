"""职责：
承载 Analysis 工作区的 conversation-level orchestration / facade。

链路位置：
上游是 API routes；当前模块负责编排 Conversation、Message 和上下文入口；
下游对接 analysis_runs、LangGraph runtime、Tool Registry、Model Gateway 和 contracts。

边界：
允许组织 Conversation、Message、AnalysisTask 和上下文选择入口；
不允许拥有 AnalysisRun lifecycle，也不允许在这里实现具体 Agent 节点逻辑。

原因：
Analysis 工作区需要稳定的 conversation facade，
同时把 AnalysisRun 生命周期 owner 固定在 analysis_runs。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import cast
from uuid import uuid4

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    MessageRecord,
)
from src.modules.analysis_runs.lifecycle_service import build_run_created_event


class AnalysisDraftConversationMismatchError(RuntimeError):
    """Submit request mismatched the persisted Conversation chain."""


@dataclass(frozen=True)
class SubmitAnalysisDraftCommand:
    businessDomainId: str
    contextPack: AnalysisTaskContextPack | None
    conversationId: str | None
    question: str
    title: str | None
    userId: str
    workspaceId: str


@dataclass(frozen=True)
class SubmitAnalysisDraftResult:
    conversation: ConversationRecord
    analysisTask: AnalysisTaskRecord
    analysisRun: AnalysisRunRecord
    userMessage: MessageRecord


def _bind_analysis_task_owner(
    node: dict[str, object], analysis_task_id: str
) -> dict[str, object]:
    owner = node.get("owner")
    bound_owner = owner

    if isinstance(owner, dict) and owner.get("type") == "analysisTask":
        bound_owner = {
            **owner,
            "analysisTaskId": analysis_task_id,
        }

    children = node.get("children")
    bound_children = children

    if isinstance(children, list):
        bound_children = [
            _bind_analysis_task_owner(child, analysis_task_id)
            if isinstance(child, dict)
            else child
            for child in children
        ]

    return {
        **node,
        "owner": bound_owner,
        "children": bound_children,
    }


def bind_analysis_task_context_pack(
    context_pack: AnalysisTaskContextPack | None, analysis_task_id: str
) -> AnalysisTaskContextPack | None:
    if context_pack is None:
        return None

    root = _bind_analysis_task_owner(context_pack["root"], analysis_task_id)

    return {
        **context_pack,
        "root": cast(object, root),
    }


def _generate_canonical_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def _utc_timestamp() -> str:
    return datetime.now(tz=UTC).isoformat().replace("+00:00", "Z")


def _normalize_title(text: str) -> str:
    return " ".join(text.split())


def derive_conversation_title(question: str, explicit_title: str | None) -> str:
    if explicit_title:
        normalized_title = _normalize_title(explicit_title)
        if normalized_title:
            return normalized_title

    normalized_question = _normalize_title(question)
    if len(normalized_question) <= 24:
        return normalized_question
    return f"{normalized_question[:24].rstrip()}..."


class AnalysisSubmitService:
    """Canonical draft submit orchestration for Conversation / AnalysisTask / AnalysisRun / Message."""

    def __init__(
        self,
        *,
        analysis_task_repository: AnalysisTaskRepository,
        conversation_repository: ConversationRepository,
        lifecycle_repository: AnalysisRunLifecycleRepository,
    ) -> None:
        self._analysis_task_repository = analysis_task_repository
        self._conversation_repository = conversation_repository
        self._lifecycle_repository = lifecycle_repository

    def submit_draft(self, command: SubmitAnalysisDraftCommand) -> SubmitAnalysisDraftResult:
        conversation = self._load_or_create_conversation(command)
        now = _utc_timestamp()
        analysis_task_id = _generate_canonical_id("analysis-task")

        analysis_task: AnalysisTaskRecord = {
            "analysisTaskId": analysis_task_id,
            "conversationId": conversation["conversationId"],
            "workspaceId": command.workspaceId,
            "userId": command.userId,
            "businessDomainId": command.businessDomainId,
            "question": command.question,
            "contextPack": bind_analysis_task_context_pack(command.contextPack, analysis_task_id),
            "createdAt": now,
            "updatedAt": now,
        }
        analysis_run: AnalysisRunRecord = {
            "runId": _generate_canonical_id("analysis-run"),
            "workspaceId": command.workspaceId,
            "userId": command.userId,
            "analysisTaskId": analysis_task["analysisTaskId"],
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
        user_message: MessageRecord = {
            "messageId": _generate_canonical_id("message"),
            "conversationId": conversation["conversationId"],
            "analysisTaskId": analysis_task["analysisTaskId"],
            "turnId": _generate_canonical_id("turn"),
            "runId": analysis_run["runId"],
            "role": "user",
            "content": command.question,
            "status": "completed",
            "sourceEvidenceIds": [],
            "toolCallIds": [],
            "reportId": None,
            "createdAt": now,
            "completedAt": now,
        }
        persisted_conversation: ConversationRecord = {
            **conversation,
            "currentRunId": analysis_run["runId"],
            "updatedAt": now,
        }
        run_created_event = build_run_created_event(run_id=analysis_run["runId"], occurred_at=now)

        self._lifecycle_repository.submit_draft(
            persisted_conversation,
            analysis_task,
            analysis_run,
            user_message,
            run_created_event,
        )

        return SubmitAnalysisDraftResult(
            conversation=persisted_conversation,
            analysisTask=analysis_task,
            analysisRun=analysis_run,
            userMessage=user_message,
        )

    def _load_or_create_conversation(
        self, command: SubmitAnalysisDraftCommand
    ) -> ConversationRecord:
        if command.conversationId is None:
            now = _utc_timestamp()
            return {
                "conversationId": _generate_canonical_id("conversation"),
                "workspaceId": command.workspaceId,
                "userId": command.userId,
                "currentRunId": None,
                "title": derive_conversation_title(command.question, command.title),
                "status": "active",
                "createdAt": now,
                "updatedAt": now,
            }

        return self._conversation_repository.get_by_conversation_id_and_owner(
            command.conversationId,
            workspace_id=command.workspaceId,
            user_id=command.userId,
        )

    def _validate_conversation_chain(
        self, command: SubmitAnalysisDraftCommand, conversation: ConversationRecord
    ) -> None:
        for field_name in ("workspaceId", "userId"):
            if conversation[field_name] != getattr(command, field_name):
                raise AnalysisDraftConversationMismatchError(
                    f"Conversation.{field_name} does not match request.{field_name}"
                )
