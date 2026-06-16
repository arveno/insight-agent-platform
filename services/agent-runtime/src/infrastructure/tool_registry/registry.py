"""职责：
集中登记、校验和分发 Agent 可调用工具，是所有工具调用的唯一入口。

链路位置：
上游是 runtime / agents 的工具调用请求；当前模块负责注册表边界；下游是具体 tool adapter。

边界：
允许维护工具元信息、权限、风险等级、输入输出契约和调用入口；不允许在 Agent 中绕过注册表直连工具。

原因：
工具调用需要统一治理、审计和观测，避免 SQL、RAG、Memory、Report 等能力形成失控的分散入口。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, cast

from src.infrastructure.database.runtime_foundation import AnalysisTaskRecord, ToolCallRecord
from src.infrastructure.tool_registry.analysis_context_summary_tool import (
    AnalysisContextSummaryOutput,
    AnalysisContextSummaryTool,
)


@dataclass(frozen=True, slots=True)
class ToolDefinition:
    permission: str
    risk_level: Literal["low", "medium", "high", "critical"]
    tool_name: str


@dataclass(frozen=True, slots=True)
class ToolExecutionResult:
    output: AnalysisContextSummaryOutput
    tool_call: ToolCallRecord


class ToolRegistryExecutionError(RuntimeError):
    def __init__(self, tool_call: ToolCallRecord) -> None:
        super().__init__(
            tool_call["errorMessage"] or tool_call["errorType"] or "tool_registry_error"
        )
        self.tool_call = tool_call


@dataclass(slots=True)
class ToolRegistry:
    """Registry-owned tool dispatcher for runtime execution."""

    _analysis_context_summary_tool: AnalysisContextSummaryTool = AnalysisContextSummaryTool()

    def definition(self, tool_name: str) -> ToolDefinition:
        if tool_name != self._analysis_context_summary_tool.tool_name:
            raise KeyError(tool_name)
        return ToolDefinition(
            permission="analysis.context.read",
            risk_level="low",
            tool_name=tool_name,
        )

    def execute(
        self,
        *,
        analysis_task: AnalysisTaskRecord,
        run_id: str,
        started_at: str,
        tool_call_id: str,
        tool_name: str,
    ) -> ToolExecutionResult:
        definition = self.definition(tool_name)
        try:
            output = self._analysis_context_summary_tool.execute(analysis_task)
        except Exception as exc:  # pragma: no cover - defensive classification boundary
            raise ToolRegistryExecutionError(
                {
                    "toolCallId": tool_call_id,
                    "runId": run_id,
                    "toolName": definition.tool_name,
                    "input": {
                        "analysisTaskId": analysis_task["analysisTaskId"],
                        "question": analysis_task["question"],
                    },
                    "output": None,
                    "status": "failed",
                    "riskLevel": definition.risk_level,
                    "permission": definition.permission,
                    "errorType": "handler_error",
                    "errorMessage": str(exc)[:200],
                    "startedAt": started_at,
                    "completedAt": started_at,
                }
            ) from exc

        return ToolExecutionResult(
            output=output,
            tool_call={
                "toolCallId": tool_call_id,
                "runId": run_id,
                "toolName": definition.tool_name,
                "input": {
                    "analysisTaskId": analysis_task["analysisTaskId"],
                    "question": analysis_task["question"],
                    "traceability": analysis_task["contextPack"]["traceability"]
                    if analysis_task["contextPack"] is not None
                    else None,
                },
                "output": cast(dict[str, object], output),
                "status": "succeeded",
                "riskLevel": definition.risk_level,
                "permission": definition.permission,
                "errorType": None,
                "errorMessage": None,
                "startedAt": started_at,
                "completedAt": started_at,
            },
        )


@dataclass(frozen=True, slots=True)
class FoundationToolExecution:
    """Deterministic foundation Tool Registry output for the first delivery slice."""

    tool_call: ToolCallRecord
    conclusion: str


@dataclass(slots=True)
class FoundationToolRegistry:
    """Single-path Tool Registry entry for the delivery foundation slice."""

    tool_name: str = "metrics.summary.compare"
    permission: str = "metrics.read"
    risk_level: Literal["medium"] = "medium"

    def execute_metrics_summary(self, *, run_id: str, occurred_at: str) -> FoundationToolExecution:
        conclusion = "华东渠道确认延迟明显。"
        tool_call: ToolCallRecord = {
            "toolCallId": f"tool-call-{run_id}-metrics",
            "runId": run_id,
            "toolName": self.tool_name,
            "input": {"request": self.tool_name},
            "output": {"conclusion": conclusion},
            "status": "succeeded",
            "riskLevel": self.risk_level,
            "permission": self.permission,
            "errorType": None,
            "errorMessage": None,
            "startedAt": occurred_at,
            "completedAt": occurred_at,
        }
        return FoundationToolExecution(tool_call=tool_call, conclusion=conclusion)
