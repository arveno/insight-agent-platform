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
from typing import Literal

from src.infrastructure.database.runtime_foundation import ToolCallRecord


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
