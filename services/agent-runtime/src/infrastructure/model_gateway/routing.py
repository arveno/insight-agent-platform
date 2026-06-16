"""职责：
承载模型路由策略的模块位置。

链路位置：
上游是 Model Gateway；当前模块选择模型和 provider；下游是具体 provider adapter。

边界：
允许依据 RoutingPolicy、ModelConfig 和运行上下文选择模型；不允许在业务层散落模型选择逻辑。

原因：
模型选择影响成本、质量和稳定性，必须集中治理并可被审计和回放。
"""

from __future__ import annotations

from src.app.config import ModelGatewaySettings, ModelProviderSettings
from src.infrastructure.model_gateway.errors import ModelGatewayConfigurationError

SUPPORTED_MODEL_PROVIDER_NAMES: tuple[str, ...] = ("siliconflow", "zhipu")
SUPPORTED_MODEL_API_FORMATS: tuple[str, ...] = ("openai_chat_completions",)


def resolve_model_provider(
    settings: ModelGatewaySettings,
    provider_name: str | None = None,
) -> ModelProviderSettings:
    requested_provider = (provider_name or settings.active_provider).strip().lower()
    if not requested_provider or requested_provider not in SUPPORTED_MODEL_PROVIDER_NAMES:
        raise ModelGatewayConfigurationError(
            "invalid_provider",
            f"provider={requested_provider or '<missing>'}",
        )

    provider = settings.provider(requested_provider)
    if provider is None:
        raise ModelGatewayConfigurationError(
            "invalid_provider",
            f"provider={requested_provider}",
        )
    return provider
