"""职责：
承载统一模型调用入口，所有 LLM 请求必须经过这里。

链路位置：
上游是 application / runtime / agents 的模型请求；当前模块是 Model Gateway；
下游是 routing、provider adapter、cost 和 observability。

边界：
允许统一处理 provider、路由、重试、错误映射和观测字段；
不允许业务代码或 Agent 直接调用模型 provider。

原因：
模型调用需要统一成本、延迟、失败和审计口径，避免不同模块形成不可控的模型访问路径。
"""

from __future__ import annotations

from dataclasses import dataclass

from src.infrastructure.database.runtime_foundation import ModelCallRecord


@dataclass(frozen=True, slots=True)
class FoundationModelGeneration:
    """Deterministic Model Gateway output for the delivery foundation slice."""

    model_call: ModelCallRecord
    assistant_content: str


@dataclass(slots=True)
class FoundationModelGateway:
    """Single-path Model Gateway entry for the delivery foundation slice."""

    provider: str = "openai"
    model_id: str = "gpt-4.1-static"
    prompt_version_id: str = "prompt-revenue-gap-v1"

    def generate_delivery_summary(
        self,
        *,
        run_id: str,
        occurred_at: str,
        tool_conclusion: str,
    ) -> FoundationModelGeneration:
        assistant_content = (
            "收入增速下滑主要来自华东核心渠道确认延迟与促销库存错配，而不是整体价格体系失效。"
        )
        model_call: ModelCallRecord = {
            "modelCallId": f"model-call-{run_id}-summary",
            "runId": run_id,
            "provider": self.provider,
            "modelId": self.model_id,
            "promptVersionId": self.prompt_version_id,
            "inputTokens": 6120,
            "outputTokens": 6360,
            "cost": 0.86,
            "latencyMs": 18200,
            "status": "succeeded",
            "errorType": None,
            "errorMessage": None,
            "startedAt": occurred_at,
            "completedAt": occurred_at,
        }
        _ = tool_conclusion
        return FoundationModelGeneration(
            model_call=model_call,
            assistant_content=assistant_content,
        )
