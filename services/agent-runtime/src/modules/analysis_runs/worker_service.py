"""Scoped worker execution path for #240 real ToolCall and ModelCall runtime flow."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, Literal, TypedDict, cast
from uuid import uuid4

from langgraph.graph import END, START, StateGraph
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRepository,
    ExecutionAttemptRecord,
    ExecutionAttemptRepository,
    MessageRecord,
    MessageRepository,
    MessageStreamRepository,
    ModelCallRecord,
    RunEventRecord,
    RunEventRepository,
    RuntimeFoundationDatabase,
    ToolCallRecord,
)
from src.infrastructure.model_gateway.failure_taxonomy import (
    build_failed_model_call,
    classify_worker_integration_bug,
)
from src.infrastructure.model_gateway.gateway import ModelGateway, ModelGatewayInvocationError
from src.infrastructure.tool_registry.registry import ToolRegistry, ToolRegistryExecutionError
from src.modules.analysis_runs.lifecycle_service import AnalysisRunLifecycleService
from src.modules.analysis_runs.message_streaming import (
    RuntimeMessageStreamService,
    build_message_stream_record,
    build_placeholder_assistant_message,
    chunk_message_stream_deltas,
)

PROMPT_VERSION_ID = "prompt-runtime-worker-synthesis-v1"
TOOL_NAME = "analysis_context_summary"
WORKER_ID = "agent-worker-langgraph"
WORKER_ACTOR = "agent_worker"
AGENT_NAME = "analysis-runtime"
RunPhase = Literal[
    "intake",
    "preflight",
    "governance",
    "context_binding",
    "planning",
    "approval",
    "queueing",
    "execution",
    "tool_execution",
    "evidence_binding",
    "synthesis",
    "verification",
    "delivery",
    "post_run",
]
RunEventStatus = Literal["pending", "running", "succeeded", "failed", "skipped", "cancelled"]
RunOutcome = Literal[
    "success",
    "partial_success",
    "policy_rejected",
    "user_cancelled",
    "timeout",
    "system_failure",
    "tool_failure",
    "model_failure",
    "verification_failure",
]


class WorkerExecutionState(TypedDict):
    analysis_run: AnalysisRunRecord
    analysis_task: AnalysisTaskRecord
    assistant_message: MessageRecord | None
    execution_attempt: ExecutionAttemptRecord
    model_call: ModelCallRecord | None
    model_output: str | None
    next_sequence: int
    tool_call: ToolCallRecord | None
    tool_summary: str | None
    user_submit_message: MessageRecord


class AnalysisRunExecutionResult(TypedDict):
    analysisRun: AnalysisRunRecord
    executionAttempt: ExecutionAttemptRecord
    modelCall: ModelCallRecord
    toolCall: ToolCallRecord


@dataclass
class AnalysisRunExecutionWorker:
    database: RuntimeFoundationDatabase
    model_gateway: ModelGateway
    tool_registry: ToolRegistry
    worker_id: str = WORKER_ID
    _analysis_run_repository: AnalysisRunRepository = field(init=False)
    _analysis_task_repository: AnalysisTaskRepository = field(init=False)
    _execution_attempt_repository: ExecutionAttemptRepository = field(init=False)
    _message_repository: MessageRepository = field(init=False)
    _message_stream_service: RuntimeMessageStreamService = field(init=False)
    _run_event_repository: RunEventRepository = field(init=False)
    _lifecycle_repository: AnalysisRunLifecycleRepository = field(init=False)
    _lifecycle_service: AnalysisRunLifecycleService = field(init=False)

    def __post_init__(self) -> None:
        self._analysis_run_repository = AnalysisRunRepository(self.database)
        self._analysis_task_repository = AnalysisTaskRepository(self.database)
        self._execution_attempt_repository = ExecutionAttemptRepository(self.database)
        self._message_repository = MessageRepository(self.database)
        self._run_event_repository = RunEventRepository(self.database)
        self._lifecycle_repository = AnalysisRunLifecycleRepository(self.database)
        self._lifecycle_service = AnalysisRunLifecycleService(
            analysis_run_repository=self._analysis_run_repository,
            conversation_repository=ConversationRepository(self.database),
            execution_attempt_repository=self._execution_attempt_repository,
            run_event_repository=self._run_event_repository,
            lifecycle_repository=self._lifecycle_repository,
            worker_id=self.worker_id,
        )
        self._message_stream_service = RuntimeMessageStreamService(
            lifecycle_repository=self._lifecycle_repository,
            message_repository=self._message_repository,
            message_stream_repository=MessageStreamRepository(self.database),
        )

    def execute_run(self, run_id: str) -> AnalysisRunExecutionResult:
        analysis_run = self._lifecycle_service.claim_for_execution(run_id, self.worker_id)
        execution_attempt = self._execution_attempt_repository.list_by_run_id(run_id)[-1]
        analysis_task = self._analysis_task_repository.get_by_analysis_task_id(
            analysis_run["analysisTaskId"]
        )
        user_submit_message = self._require_user_submit_message(
            analysis_task_id=analysis_run["analysisTaskId"],
            run_id=run_id,
        )
        initial_state: WorkerExecutionState = {
            "analysis_run": analysis_run,
            "analysis_task": analysis_task,
            "assistant_message": None,
            "execution_attempt": execution_attempt,
            "model_call": None,
            "model_output": None,
            "next_sequence": self._next_sequence(run_id),
            "tool_call": None,
            "tool_summary": None,
            "user_submit_message": user_submit_message,
        }
        graph = cast(Any, self._build_graph())
        final_state = cast(WorkerExecutionState, graph.invoke(initial_state))
        if final_state["tool_call"] is None or final_state["model_call"] is None:
            raise RuntimeError(
                "Worker execution did not produce the expected ToolCall / ModelCall."
            )
        return {
            "analysisRun": final_state["analysis_run"],
            "executionAttempt": final_state["execution_attempt"],
            "modelCall": final_state["model_call"],
            "toolCall": final_state["tool_call"],
        }

    def _build_graph(self) -> Any:
        graph = StateGraph(WorkerExecutionState)
        graph.add_node("preflight", self._preflight)
        graph.add_node("context_binding", self._context_binding)
        graph.add_node("tool_execution", self._tool_execution)
        graph.add_node("model_generation", self._model_generation)
        graph.add_node("synthesis_handoff", self._synthesis_handoff)
        graph.add_edge(START, "preflight")
        graph.add_edge("preflight", "context_binding")
        graph.add_edge("context_binding", "tool_execution")
        graph.add_conditional_edges(
            "tool_execution",
            self._route_after_execution,
            {"continue": "model_generation", "stop": END},
        )
        graph.add_conditional_edges(
            "model_generation",
            self._route_after_execution,
            {"continue": "synthesis_handoff", "stop": END},
        )
        graph.add_edge("synthesis_handoff", END)
        return graph.compile()

    def _route_after_execution(self, state: WorkerExecutionState) -> Literal["continue", "stop"]:
        return "stop" if state["analysis_run"]["status"] == "failed" else "continue"

    def _preflight(self, state: WorkerExecutionState) -> WorkerExecutionState:
        run = _update_analysis_run(
            state["analysis_run"],
            phase="execution",
            startedAt=state["analysis_run"]["startedAt"] or _utc_now(),
        )
        occurred_at = _utc_now()
        event = self._build_run_event(
            event_type="run.started",
            occurred_at=occurred_at,
            phase="execution",
            run_id=run["runId"],
            sequence=state["next_sequence"],
            status="succeeded",
            summary="记录 Worker 已进入真实执行主链。",
        )
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            run_events=[event],
        )
        return {
            **state,
            "analysis_run": run,
            "next_sequence": state["next_sequence"] + 1,
        }

    def _context_binding(self, state: WorkerExecutionState) -> WorkerExecutionState:
        run = _update_analysis_run(state["analysis_run"], phase="context_binding")
        occurred_at = _utc_now()
        event = self._build_run_event(
            event_type="context.bound",
            occurred_at=occurred_at,
            phase="context_binding",
            run_id=run["runId"],
            sequence=state["next_sequence"],
            status="succeeded",
            summary="记录 AnalysisTask.contextPack 已绑定到当前真实执行。",
        )
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            run_events=[event],
        )
        return {
            **state,
            "analysis_run": run,
            "next_sequence": state["next_sequence"] + 1,
        }

    def _tool_execution(self, state: WorkerExecutionState) -> WorkerExecutionState:
        run = _update_analysis_run(state["analysis_run"], phase="tool_execution")
        tool_call_id = _generate_canonical_id("tool-call")
        started_at = _utc_now()
        tool_definition = self.tool_registry.definition(TOOL_NAME)
        running_tool_call: ToolCallRecord = {
            "toolCallId": tool_call_id,
            "runId": run["runId"],
            "toolName": TOOL_NAME,
            "input": {
                "analysisTaskId": state["analysis_task"]["analysisTaskId"],
                "question": state["analysis_task"]["question"],
                "traceability": state["analysis_task"]["contextPack"]["traceability"]
                if state["analysis_task"]["contextPack"] is not None
                else None,
            },
            "output": None,
            "status": "running",
            "riskLevel": tool_definition.risk_level,
            "permission": tool_definition.permission,
            "errorType": None,
            "errorMessage": None,
            "startedAt": started_at,
            "completedAt": None,
        }
        start_events = [
            self._build_run_event(
                event_type="tool_call.requested",
                occurred_at=started_at,
                phase="tool_execution",
                ref_id=tool_call_id,
                ref_type="toolCall",
                run_id=run["runId"],
                sequence=state["next_sequence"],
                status="succeeded",
                summary="记录 read-only Tool Registry 调用已进入请求阶段。",
                tool_name=TOOL_NAME,
            ),
            self._build_run_event(
                event_type="tool_call.policy_checked",
                occurred_at=started_at,
                phase="tool_execution",
                ref_id=tool_call_id,
                ref_type="toolCall",
                run_id=run["runId"],
                sequence=state["next_sequence"] + 1,
                status="succeeded",
                summary="记录 Tool Registry 已完成权限与风险元数据校验。",
                tool_name=TOOL_NAME,
            ),
            self._build_run_event(
                event_type="tool_call.started",
                occurred_at=started_at,
                phase="tool_execution",
                ref_id=tool_call_id,
                ref_type="toolCall",
                run_id=run["runId"],
                sequence=state["next_sequence"] + 2,
                status="running",
                summary="记录 Tool Registry handler 已开始执行。",
                tool_name=TOOL_NAME,
            ),
        ]
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            run_events=start_events,
            tool_call=running_tool_call,
        )
        next_sequence = state["next_sequence"] + len(start_events)

        try:
            tool_result = self.tool_registry.execute(
                analysis_task=state["analysis_task"],
                run_id=run["runId"],
                started_at=started_at,
                tool_call_id=tool_call_id,
                tool_name=TOOL_NAME,
            )
        except ToolRegistryExecutionError as exc:
            completed_at = _utc_now()
            failed_tool_call = _update_tool_call(
                exc.tool_call,
                completedAt=completed_at,
                startedAt=started_at,
            )
            failed_attempt = _update_execution_attempt(
                state["execution_attempt"],
                failureCode=failed_tool_call["errorType"],
                failureMessage=failed_tool_call["errorMessage"],
                releasedAt=completed_at,
                status="failed",
            )
            failed_run = _build_failed_run(
                analysis_run=run,
                failure_code=failed_tool_call["errorType"] or "tool_failure",
                failure_message=failed_tool_call["errorMessage"] or "Tool execution failed.",
                occurred_at=completed_at,
                outcome="tool_failure",
                phase="tool_execution",
            )
            failure_events = [
                self._build_run_event(
                    event_type="tool_call.failed",
                    occurred_at=completed_at,
                    error_code=failed_tool_call["errorType"],
                    error_message=failed_tool_call["errorMessage"],
                    phase="tool_execution",
                    ref_id=tool_call_id,
                    ref_type="toolCall",
                    run_id=run["runId"],
                    sequence=next_sequence,
                    status="failed",
                    summary="记录 Tool Registry handler 执行失败。",
                    tool_name=TOOL_NAME,
                ),
                self._build_run_event(
                    event_type="run.failed",
                    occurred_at=completed_at,
                    error_code=failed_tool_call["errorType"],
                    error_message=failed_tool_call["errorMessage"],
                    phase="tool_execution",
                    run_id=run["runId"],
                    sequence=next_sequence + 1,
                    status="failed",
                    summary="记录 AnalysisRun 因 Tool Registry 调用失败进入 failed。",
                ),
            ]
            self._lifecycle_repository.record_execution_state(
                analysis_run=failed_run,
                execution_attempt=failed_attempt,
                run_events=failure_events,
                tool_call=failed_tool_call,
            )
            return {
                **state,
                "analysis_run": failed_run,
                "execution_attempt": failed_attempt,
                "next_sequence": next_sequence + len(failure_events),
                "tool_call": failed_tool_call,
                "tool_summary": failed_tool_call["errorMessage"],
            }

        completed_at = _utc_now()
        completed_tool_call = _update_tool_call(
            tool_result.tool_call,
            completedAt=completed_at,
            startedAt=started_at,
        )
        completed_event = self._build_run_event(
            event_type="tool_call.completed",
            occurred_at=completed_at,
            phase="tool_execution",
            ref_id=tool_call_id,
            ref_type="toolCall",
            run_id=run["runId"],
            sequence=next_sequence,
            status="succeeded",
            summary="记录 read-only Tool Registry 调用已完成并返回上下文摘要。",
            tool_name=TOOL_NAME,
        )
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            run_events=[completed_event],
            tool_call=completed_tool_call,
        )
        return {
            **state,
            "analysis_run": run,
            "next_sequence": next_sequence + 1,
            "tool_call": completed_tool_call,
            "tool_summary": tool_result.output["summary"],
        }

    def _model_generation(self, state: WorkerExecutionState) -> WorkerExecutionState:
        run = _update_analysis_run(state["analysis_run"], phase="synthesis")
        target = self.model_gateway.describe_target()
        model_call_id = _generate_canonical_id("model-call")
        started_at = _utc_now()
        running_model_call: ModelCallRecord = {
            "modelCallId": model_call_id,
            "runId": run["runId"],
            "provider": target.provider,
            "modelId": target.model_id,
            "promptVersionId": PROMPT_VERSION_ID,
            "inputTokens": 0,
            "outputTokens": 0,
            "cost": 0.0,
            "latencyMs": 0,
            "status": "running",
            "errorType": None,
            "errorMessage": None,
            "failureClass": None,
            "httpStatus": None,
            "providerErrorCode": None,
            "providerRequestId": None,
            "timeoutMs": None,
            "retryable": None,
            "retryAfterMs": None,
            "rawErrorRedacted": None,
            "startedAt": started_at,
            "completedAt": None,
        }
        model_prompt = (
            f"Question:\n{state['analysis_task']['question']}\n\n"
            f"Context summary:\n{state['tool_summary'] or 'No tool summary available.'}\n\n"
            "Return a concise synthesis of the most likely drivers. "
            "Do not invent evidence, report, decision, or assistant delivery artifacts."
        )
        started_event = self._build_run_event(
            event_type="model_call.started",
            occurred_at=started_at,
            phase="synthesis",
            ref_id=model_call_id,
            ref_type="modelCall",
            run_id=run["runId"],
            sequence=state["next_sequence"],
            status="running",
            summary="记录 Model Gateway 已开始真实外部模型调用。",
        )
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            model_call=running_model_call,
            run_events=[started_event],
        )
        placeholder_message = build_placeholder_assistant_message(
            analysis_task_id=state["analysis_task"]["analysisTaskId"],
            conversation_id=state["analysis_task"]["conversationId"],
            created_at=started_at,
            run_id=run["runId"],
            tool_call_ids=(
                [state["tool_call"]["toolCallId"]] if state["tool_call"] is not None else []
            ),
            turn_id=state["user_submit_message"]["turnId"],
        )
        started_stream = build_message_stream_record(
            conversation_id=placeholder_message["conversationId"],
            message_id=placeholder_message["messageId"],
            run_id=run["runId"],
            sequence=0,
            event_type="stream.started",
            delta="",
            occurred_at=started_at,
        )
        assistant_message = self._message_stream_service.persist_runtime_message_stream(
            message=placeholder_message,
            message_streams=[started_stream],
        )
        next_sequence = state["next_sequence"] + 1

        try:
            model_result = self.model_gateway.generate_text(
                model_call_id=model_call_id,
                prompt=model_prompt,
                prompt_version_id=PROMPT_VERSION_ID,
                run_id=run["runId"],
                started_at=started_at,
            )
        except ModelGatewayInvocationError as exc:
            failed_message = _update_message(
                assistant_message,
                content=assistant_message["content"],
                status="failed",
                completedAt=exc.model_call["completedAt"] or started_at,
            )
            failed_stream = build_message_stream_record(
                conversation_id=assistant_message["conversationId"],
                message_id=assistant_message["messageId"],
                run_id=run["runId"],
                sequence=1,
                event_type="stream.failed",
                delta="",
                occurred_at=exc.model_call["completedAt"] or started_at,
                error_code=exc.model_call["errorType"],
                error_message=exc.model_call["errorMessage"],
            )
            self._message_stream_service.persist_runtime_message_stream(
                message=failed_message,
                message_streams=[failed_stream],
            )
            failed_attempt = _update_execution_attempt(
                state["execution_attempt"],
                failureCode=exc.model_call["failureClass"],
                failureMessage=exc.model_call["errorMessage"],
                releasedAt=exc.model_call["completedAt"],
                status="failed",
            )
            failed_run = _build_failed_run(
                analysis_run=run,
                failure_code=exc.model_call["failureClass"] or "model_failure",
                failure_message=exc.model_call["errorMessage"] or "Model call failed.",
                occurred_at=exc.model_call["completedAt"] or started_at,
                outcome="model_failure",
                phase="synthesis",
                retryable=exc.model_call["retryable"],
            )
            failure_events = [
                self._build_run_event(
                    event_type="model_call.failed",
                    occurred_at=exc.model_call["completedAt"] or started_at,
                    error_code=exc.model_call["failureClass"],
                    error_message=exc.model_call["errorMessage"],
                    phase="synthesis",
                    ref_id=model_call_id,
                    ref_type="modelCall",
                    run_id=run["runId"],
                    sequence=next_sequence,
                    status="failed",
                    summary="记录 Model Gateway 真实外部调用失败。",
                ),
                self._build_run_event(
                    event_type="run.failed",
                    occurred_at=exc.model_call["completedAt"] or started_at,
                    error_code=exc.model_call["failureClass"],
                    error_message=exc.model_call["errorMessage"],
                    phase="synthesis",
                    run_id=run["runId"],
                    sequence=next_sequence + 1,
                    status="failed",
                    summary="记录 AnalysisRun 因真实模型调用失败进入 failed。",
                ),
            ]
            self._lifecycle_repository.record_execution_state(
                analysis_run=failed_run,
                execution_attempt=failed_attempt,
                model_call=exc.model_call,
                run_events=failure_events,
            )
            return {
                **state,
                "analysis_run": failed_run,
                "assistant_message": failed_message,
                "execution_attempt": failed_attempt,
                "model_call": exc.model_call,
                "model_output": None,
                "next_sequence": next_sequence + len(failure_events),
            }
        except Exception as exc:
            failed_model_call = build_failed_model_call(
                failure=classify_worker_integration_bug(exc, api_key=""),
                completed_at=_utc_now(),
                latency_ms=0,
                model_call_id=model_call_id,
                model_id=target.model_id,
                prompt_version_id=PROMPT_VERSION_ID,
                provider=target.provider,
                run_id=run["runId"],
                started_at=started_at,
            )
            failed_attempt = _update_execution_attempt(
                state["execution_attempt"],
                failureCode=failed_model_call["failureClass"],
                failureMessage=failed_model_call["errorMessage"],
                releasedAt=failed_model_call["completedAt"],
                status="failed",
            )
            failed_run = _build_failed_run(
                analysis_run=run,
                failure_code=failed_model_call["failureClass"] or "worker_integration_bug",
                failure_message=failed_model_call["errorMessage"] or "Model call failed.",
                occurred_at=failed_model_call["completedAt"] or started_at,
                outcome="model_failure",
                phase="synthesis",
                retryable=failed_model_call["retryable"],
            )
            failure_events = [
                self._build_run_event(
                    event_type="model_call.failed",
                    occurred_at=failed_model_call["completedAt"] or started_at,
                    error_code=failed_model_call["failureClass"],
                    error_message=failed_model_call["errorMessage"],
                    phase="synthesis",
                    ref_id=model_call_id,
                    ref_type="modelCall",
                    run_id=run["runId"],
                    sequence=next_sequence,
                    status="failed",
                    summary="记录 Worker 与 Model Gateway 集成失败。",
                ),
                self._build_run_event(
                    event_type="run.failed",
                    occurred_at=failed_model_call["completedAt"] or started_at,
                    error_code=failed_model_call["failureClass"],
                    error_message=failed_model_call["errorMessage"],
                    phase="synthesis",
                    run_id=run["runId"],
                    sequence=next_sequence + 1,
                    status="failed",
                    summary="记录 AnalysisRun 因 Worker / Model Gateway 集成失败进入 failed。",
                ),
            ]
            self._lifecycle_repository.record_execution_state(
                analysis_run=failed_run,
                execution_attempt=failed_attempt,
                model_call=failed_model_call,
                run_events=failure_events,
            )
            return {
                **state,
                "analysis_run": failed_run,
                "execution_attempt": failed_attempt,
                "model_call": failed_model_call,
                "model_output": None,
                "next_sequence": next_sequence + len(failure_events),
            }

        delta_chunks = chunk_message_stream_deltas(model_result.output_text)
        completed_streams = [
            build_message_stream_record(
                conversation_id=assistant_message["conversationId"],
                message_id=assistant_message["messageId"],
                run_id=run["runId"],
                sequence=index + 1,
                event_type="stream.delta",
                delta=chunk,
                occurred_at=model_result.model_call["completedAt"] or started_at,
            )
            for index, chunk in enumerate(delta_chunks)
        ]
        completed_streams.append(
            build_message_stream_record(
                conversation_id=assistant_message["conversationId"],
                message_id=assistant_message["messageId"],
                run_id=run["runId"],
                sequence=len(completed_streams) + 1,
                event_type="stream.completed",
                delta="",
                occurred_at=model_result.model_call["completedAt"] or started_at,
            )
        )
        updated_message = _update_message(
            assistant_message,
            content=model_result.output_text,
            status="streaming",
            completedAt=None,
        )
        persisted_message = self._message_stream_service.persist_runtime_message_stream(
            message=updated_message,
            message_streams=completed_streams,
        )
        completed_event = self._build_run_event(
            event_type="model_call.completed",
            occurred_at=model_result.model_call["completedAt"] or started_at,
            phase="synthesis",
            ref_id=model_call_id,
            ref_type="modelCall",
            run_id=run["runId"],
            sequence=next_sequence,
            status="succeeded",
            summary="记录 Model Gateway 真实外部调用已返回结构化结论。",
        )
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            model_call=model_result.model_call,
            run_events=[completed_event],
        )
        return {
            **state,
            "analysis_run": run,
            "assistant_message": persisted_message,
            "model_call": model_result.model_call,
            "model_output": model_result.output_text,
            "next_sequence": next_sequence + 1,
        }

    def _synthesis_handoff(self, state: WorkerExecutionState) -> WorkerExecutionState:
        occurred_at = _utc_now()
        released_attempt = _update_execution_attempt(
            state["execution_attempt"],
            failureCode=None,
            failureMessage=None,
            releasedAt=occurred_at,
            status="released",
        )
        run = _update_analysis_run(state["analysis_run"], phase="synthesis", status="running")
        handoff_events = [
            self._build_run_event(
                event_type="synthesis.started",
                occurred_at=occurred_at,
                phase="synthesis",
                run_id=run["runId"],
                sequence=state["next_sequence"],
                status="succeeded",
                summary=(
                    "记录 ToolCall / ModelCall 已完成，当前运行停留在 synthesis，"
                    "等待后续 delivery 范围实现。"
                ),
            ),
            self._build_run_event(
                event_type="worker.lease_released",
                occurred_at=occurred_at,
                phase="synthesis",
                run_id=run["runId"],
                sequence=state["next_sequence"] + 1,
                status="succeeded",
                summary="记录 Worker 已释放当前 AnalysisRun lease，运行保持 pre-delivery 状态。",
            ),
        ]
        self._lifecycle_repository.record_execution_state(
            analysis_run=run,
            execution_attempt=released_attempt,
            run_events=handoff_events,
        )
        return {
            **state,
            "analysis_run": run,
            "execution_attempt": released_attempt,
            "next_sequence": state["next_sequence"] + len(handoff_events),
        }

    def _build_run_event(
        self,
        *,
        event_type: str,
        occurred_at: str,
        phase: RunPhase,
        run_id: str,
        sequence: int,
        status: RunEventStatus,
        summary: str,
        error_code: str | None = None,
        error_message: str | None = None,
        ref_id: str | None = None,
        ref_type: str | None = None,
        tool_name: str | None = None,
    ) -> RunEventRecord:
        return {
            "eventId": _generate_canonical_id("event"),
            "runId": run_id,
            "eventType": event_type,
            "status": status,
            "phase": phase,
            "sequence": sequence,
            "actor": WORKER_ACTOR,
            "occurredAt": occurred_at,
            "summary": summary,
            "parentEventId": None,
            "refType": ref_type,
            "refId": ref_id,
            "errorCode": error_code,
            "errorMessage": error_message,
            "nodeName": event_type,
            "agentName": AGENT_NAME,
            "toolName": tool_name,
            "startedAt": occurred_at,
            "completedAt": None if status == "running" else occurred_at,
        }

    def _next_sequence(self, run_id: str) -> int:
        run_events = self._run_event_repository.list_by_run_id(run_id)
        if not run_events:
            return 0
        return run_events[-1]["sequence"] + 1

    def _require_user_submit_message(
        self,
        *,
        analysis_task_id: str,
        run_id: str,
    ) -> MessageRecord:
        run_messages = self._message_repository.list_by_run_id(run_id)
        for message in run_messages:
            if (
                message["role"] == "user"
                and message["analysisTaskId"] == analysis_task_id
                and message["runId"] == run_id
            ):
                return message
        raise RuntimeError(
            "Worker execution requires the persisted user submit Message bound to "
            f"runId {run_id}."
        )


def _build_failed_run(
    *,
    analysis_run: AnalysisRunRecord,
    failure_code: str,
    failure_message: str,
    occurred_at: str,
    outcome: RunOutcome,
    phase: RunPhase,
    retryable: bool | None = True,
) -> AnalysisRunRecord:
    return _update_analysis_run(
        analysis_run,
        status="failed",
        phase=phase,
        outcome=outcome,
        failedAt=occurred_at,
        failureCode=failure_code,
        terminalReason=failure_message,
        completedAt=None,
        expiredAt=None,
        retryable=retryable,
    )


def _update_analysis_run(
    analysis_run: AnalysisRunRecord,
    **updates: object,
) -> AnalysisRunRecord:
    return cast(AnalysisRunRecord, {**analysis_run, **updates})


def _update_execution_attempt(
    execution_attempt: ExecutionAttemptRecord,
    **updates: object,
) -> ExecutionAttemptRecord:
    return cast(ExecutionAttemptRecord, {**execution_attempt, **updates})


def _update_tool_call(
    tool_call: ToolCallRecord,
    **updates: object,
) -> ToolCallRecord:
    return cast(ToolCallRecord, {**tool_call, **updates})


def _update_message(
    message: MessageRecord,
    **updates: object,
) -> MessageRecord:
    return cast(MessageRecord, {**message, **updates})


def _generate_canonical_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def _utc_now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
