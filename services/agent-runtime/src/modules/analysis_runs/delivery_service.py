from __future__ import annotations

from dataclasses import dataclass

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    DecisionRecord,
    DecisionRepository,
    MessageRecord,
    MessageRepository,
    ModelCallRepository,
    ReportRecord,
    ReportRepository,
    RunEventRecord,
    RunEventRepository,
    SourceEvidenceRecord,
    SourceEvidenceRepository,
    ToolCallRepository,
)
from src.modules.analysis_runs.delivery_artifact_builder import (
    DeliveryArtifactBuildError,
    build_delivery_artifacts,
    utc_timestamp,
)
from src.modules.analysis_runs.lifecycle_service import (
    ANALYSIS_RUNTIME_ACTOR,
    ANALYSIS_RUNTIME_AGENT,
    AnalysisRunInvalidStateError,
)

DELIVERY_PRODUCER_ID = "delivery-producer-runtime"
DELIVERY_INVALID_STATE_MESSAGE = (
    "AnalysisRun must be running/synthesis or running/delivery before delivery completion."
)


@dataclass(slots=True)
class AnalysisRunDeliveryService:
    analysis_run_repository: AnalysisRunRepository
    analysis_task_repository: AnalysisTaskRepository
    conversation_repository: ConversationRepository
    decision_repository: DecisionRepository
    lifecycle_repository: AnalysisRunLifecycleRepository
    message_repository: MessageRepository
    model_call_repository: ModelCallRepository
    report_repository: ReportRepository
    run_event_repository: RunEventRepository
    source_evidence_repository: SourceEvidenceRepository
    tool_call_repository: ToolCallRepository

    def complete_delivery(
        self,
        run_id: str,
        producer_id: str,
        *,
        workspace_id: str,
        user_id: str,
    ) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id_and_owner(
            run_id,
            workspace_id=workspace_id,
            user_id=user_id,
        )

        if analysis_run["status"] != "running" or analysis_run["phase"] not in {
            "synthesis",
            "delivery",
        }:
            raise AnalysisRunInvalidStateError(DELIVERY_INVALID_STATE_MESSAGE)
        if producer_id != DELIVERY_PRODUCER_ID:
            raise AnalysisRunInvalidStateError(
                f"Unsupported delivery producer for AnalysisRun completion: {producer_id}"
            )

        try:
            analysis_task = self.analysis_task_repository.get_by_analysis_task_id(
                analysis_run["analysisTaskId"]
            )
        except KeyError as exc:
            raise AnalysisRunInvalidStateError(
                "Delivery completion requires a persisted AnalysisTask for the current "
                f"AnalysisRun: {analysis_run['analysisTaskId']}"
            ) from exc

        try:
            conversation = self.conversation_repository.get_by_conversation_id(
                analysis_task["conversationId"]
            )
        except KeyError as exc:
            raise AnalysisRunInvalidStateError(
                "Delivery completion requires a persisted Conversation for the current "
                f"AnalysisTask: {analysis_task['conversationId']}"
            ) from exc

        _assert_delivery_object_chain(
            analysis_run=analysis_run,
            analysis_task=analysis_task,
            conversation=conversation,
            workspace_id=workspace_id,
            user_id=user_id,
        )

        messages = self.message_repository.list_by_conversation_id(conversation["conversationId"])
        run_messages = self.message_repository.list_by_run_id(run_id)
        model_calls = self.model_call_repository.list_by_run_id(run_id)
        reports = self.report_repository.list_by_run_id(run_id)
        run_events = self.run_event_repository.list_by_run_id(run_id)
        decisions = self.decision_repository.list_by_run_id(run_id)
        source_evidence = self.source_evidence_repository.list_by_run_id(run_id)
        tool_calls = self.tool_call_repository.list_by_run_id(run_id)

        _assert_no_existing_delivery_artifacts(
            run_id=run_id,
            decisions=decisions,
            messages=run_messages,
            reports=reports,
            run_events=run_events,
            source_evidence=source_evidence,
        )

        occurred_at = utc_timestamp()

        try:
            delivery_artifacts = build_delivery_artifacts(
                analysis_run=analysis_run,
                analysis_task=analysis_task,
                conversation=conversation,
                messages=messages,
                model_calls=model_calls,
                run_events=run_events,
                tool_calls=tool_calls,
                occurred_at=occurred_at,
            )
        except DeliveryArtifactBuildError as exc:
            raise AnalysisRunInvalidStateError(str(exc)) from exc

        completed_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "completed",
            "phase": "delivery",
            "outcome": "success",
            "waitingFor": None,
            "completedAt": occurred_at,
            "failedAt": None,
            "cancelledAt": None,
            "expiredAt": None,
            "rejectedAt": None,
            "failureCode": None,
            "terminalReason": "Delivery artifacts persisted from runtime execution state.",
            "retryable": False,
        }

        self.lifecycle_repository.complete_delivery(
            analysis_run=completed_run,
            source_evidence=delivery_artifacts.source_evidence,
            report=delivery_artifacts.report,
            decision=delivery_artifacts.decision,
            message=delivery_artifacts.assistant_message,
            run_events=build_delivery_run_events(
                run_id=run_id,
                occurred_at=occurred_at,
                report=delivery_artifacts.report,
                source_evidence=delivery_artifacts.source_evidence,
                sequence_start=self._next_run_event_sequence(run_id),
            ),
        )
        return completed_run

    def _next_run_event_sequence(self, run_id: str) -> int:
        run_events = self.run_event_repository.list_by_run_id(run_id)
        if not run_events:
            return 0
        return int(run_events[-1]["sequence"]) + 1


def build_delivery_run_events(
    *,
    run_id: str,
    occurred_at: str,
    report: ReportRecord,
    source_evidence: list[SourceEvidenceRecord],
    sequence_start: int,
) -> list[RunEventRecord]:
    event_specs: tuple[tuple[str, str, str, str, str | None, str | None], ...] = (
        (
            "verification.started",
            "running",
            "verification",
            "记录当前 AnalysisRun 已开始校验 delivery artifacts 生成前置条件。",
            None,
            None,
        ),
        (
            "verification.passed",
            "succeeded",
            "verification",
            "记录当前 AnalysisRun 已确认具备 evidence / report / decision 生成条件。",
            "sourceEvidence",
            source_evidence[0]["sourceEvidenceId"],
        ),
        (
            "delivery.started",
            "succeeded",
            "delivery",
            "记录当前 AnalysisRun 已开始从 persisted execution state 生成正式交付物。",
            "report",
            report["reportId"],
        ),
        (
            "artifact.persisted",
            "succeeded",
            "delivery",
            "记录当前 AnalysisRun 的 evidence / report / decision / assistant "
            "message 已完成持久化。",
            "report",
            report["reportId"],
        ),
        (
            "run.completed",
            "succeeded",
            "delivery",
            "记录当前 AnalysisRun 已在 artifacts 落地后进入 completed / delivery。",
            None,
            None,
        ),
    )

    run_events: list[RunEventRecord] = []
    for offset, (event_type, status, phase, summary, ref_type, ref_id) in enumerate(event_specs):
        is_running_event = status == "running"
        run_events.append(
            {
                "eventId": f"event-{run_id}-{event_type.replace('.', '-')}",
                "runId": run_id,
                "eventType": event_type,
                "status": status,
                "phase": phase,
                "sequence": sequence_start + offset,
                "actor": ANALYSIS_RUNTIME_ACTOR,
                "occurredAt": occurred_at,
                "summary": summary,
                "parentEventId": None,
                "refType": ref_type,
                "refId": ref_id,
                "errorCode": None,
                "errorMessage": None,
                "nodeName": event_type,
                "agentName": ANALYSIS_RUNTIME_AGENT,
                "toolName": None,
                "startedAt": occurred_at,
                "completedAt": None if is_running_event else occurred_at,
            }
        )
    return run_events


def _assert_delivery_object_chain(
    *,
    analysis_run: AnalysisRunRecord,
    analysis_task: AnalysisTaskRecord,
    conversation: ConversationRecord,
    workspace_id: str,
    user_id: str,
) -> None:
    mismatches: list[str] = []
    if analysis_run["workspaceId"] != workspace_id:
        mismatches.append("analysisRun.workspaceId")
    if analysis_run["userId"] != user_id:
        mismatches.append("analysisRun.userId")
    if analysis_task["workspaceId"] != analysis_run["workspaceId"]:
        mismatches.append("analysisTask.workspaceId")
    if analysis_task["userId"] != analysis_run["userId"]:
        mismatches.append("analysisTask.userId")
    if conversation["workspaceId"] != analysis_run["workspaceId"]:
        mismatches.append("conversation.workspaceId")
    if conversation["userId"] != analysis_run["userId"]:
        mismatches.append("conversation.userId")
    if analysis_task["analysisTaskId"] != analysis_run["analysisTaskId"]:
        mismatches.append("analysisTask.analysisTaskId")
    if analysis_task["conversationId"] != conversation["conversationId"]:
        mismatches.append("analysisTask.conversationId")
    if conversation["currentRunId"] != analysis_run["runId"]:
        mismatches.append("conversation.currentRunId")

    if mismatches:
        mismatch_summary = ", ".join(mismatches)
        raise AnalysisRunInvalidStateError(
            "Delivery completion requires AnalysisRun / AnalysisTask / Conversation to share "
            "the same workspaceId, userId, analysisTaskId, conversationId, and currentRunId; "
            f"mismatched fields: {mismatch_summary}."
        )


def _assert_no_existing_delivery_artifacts(
    *,
    run_id: str,
    decisions: list[DecisionRecord],
    messages: list[MessageRecord],
    reports: list[ReportRecord],
    run_events: list[RunEventRecord],
    source_evidence: list[SourceEvidenceRecord],
) -> None:
    duplicates: list[str] = []
    if any(message["role"] == "assistant" and message["runId"] == run_id for message in messages):
        duplicates.append("assistant_message")
    if source_evidence:
        duplicates.append("source_evidence")
    if reports:
        duplicates.append("report")
    if decisions:
        duplicates.append("decision")
    if any(run_event["eventType"] == "run.completed" for run_event in run_events):
        duplicates.append("run_completed")

    if duplicates:
        duplicate_summary = ", ".join(duplicates)
        raise AnalysisRunInvalidStateError(
            "Delivery completion refuses to overwrite existing delivery artifacts for runId "
            f"{run_id}: {duplicate_summary}."
        )
