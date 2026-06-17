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

import json
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol, cast
from urllib.error import HTTPError, URLError
from urllib.request import Request
from urllib.request import urlopen as urllib_urlopen

from src.app.config import ModelGatewaySettings
from src.infrastructure.database.runtime_foundation import ModelCallRecord
from src.infrastructure.model_gateway.errors import ModelGatewayConfigurationError
from src.infrastructure.model_gateway.failure_taxonomy import (
    build_failed_model_call,
    classify_configuration_error,
    classify_http_error,
    classify_model_gateway_bug,
    classify_response_schema_error,
    classify_transport_error,
    sanitize_provider_error_detail,
)
from src.infrastructure.model_gateway.readiness import (
    UrlopenCallable,
    build_model_provider_readiness_report,
    build_model_provider_tls_context,
)


class ResponseLike(Protocol):
    status: int

    def read(self) -> bytes:
        ...

    def __enter__(self) -> ResponseLike:
        ...

    def __exit__(self, exc_type: object, exc: object, tb: object) -> bool | None:
        ...


@dataclass(frozen=True, slots=True)
class ModelGatewayTarget:
    provider: str
    model_id: str


@dataclass(frozen=True, slots=True)
class ModelGenerationResult:
    model_call: ModelCallRecord
    output_text: str


class ModelGatewayInvocationError(RuntimeError):
    def __init__(self, model_call: ModelCallRecord) -> None:
        super().__init__(
            model_call["errorMessage"] or model_call["errorType"] or "model_gateway_error"
        )
        self.model_call = model_call


@dataclass(slots=True)
class ModelGateway:
    """Real runtime Model Gateway entry backed by #239 provider configuration."""

    settings: ModelGatewaySettings
    urlopen: UrlopenCallable | None = None

    def describe_target(self) -> ModelGatewayTarget:
        provider_name = self.settings.active_provider.strip().lower()
        provider = self.settings.provider(provider_name) if provider_name else None
        return ModelGatewayTarget(
            provider=provider_name,
            model_id=provider.default_model if provider is not None else "",
        )

    def generate_text(
        self,
        *,
        model_call_id: str,
        prompt: str,
        prompt_version_id: str,
        run_id: str,
        started_at: str,
    ) -> ModelGenerationResult:
        target = self.describe_target()
        try:
            readiness = build_model_provider_readiness_report(self.settings)
        except ModelGatewayConfigurationError as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_configuration_error(exc, api_key=""),
                    completed_at=started_at,
                    latency_ms=0,
                    model_call_id=model_call_id,
                    model_id=target.model_id,
                    prompt_version_id=prompt_version_id,
                    provider=target.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc

        payload = {
            "model": readiness.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are the Insight Agent Platform runtime. "
                        "Provide a concise synthesis grounded only in the supplied context summary."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": self.settings.max_tokens,
            "temperature": self.settings.temperature,
        }
        request = Request(
            readiness.chat_completions_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {readiness.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        tls_context = build_model_provider_tls_context()
        started_counter = time.perf_counter()
        urlopen_callable = self.urlopen or cast(UrlopenCallable, urllib_urlopen)

        try:
            response = urlopen_callable(
                request,
                timeout=self.settings.timeout_ms / 1000,
                context=tls_context,
            )
            with response:
                raw_payload = response.read()
        except HTTPError as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_http_error(
                        exc,
                        api_key=readiness.api_key,
                        timeout_ms=self.settings.timeout_ms,
                    ),
                    completed_at=_current_completed_at(started_at),
                    latency_ms=_latency_ms(started_counter),
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc
        except URLError as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_transport_error(
                        exc,
                        api_key=readiness.api_key,
                        timeout_ms=self.settings.timeout_ms,
                    ),
                    completed_at=_current_completed_at(started_at),
                    latency_ms=_latency_ms(started_counter),
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc
        except OSError as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_transport_error(
                        exc,
                        api_key=readiness.api_key,
                        timeout_ms=self.settings.timeout_ms,
                    ),
                    completed_at=_current_completed_at(started_at),
                    latency_ms=_latency_ms(started_counter),
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc
        except Exception as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_model_gateway_bug(exc, api_key=readiness.api_key),
                    completed_at=_current_completed_at(started_at),
                    latency_ms=_latency_ms(started_counter),
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc

        latency_ms = _latency_ms(started_counter)
        completed_at = _current_completed_at(started_at)

        try:
            payload_object = cast(dict[str, object], json.loads(raw_payload.decode("utf-8")))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_response_schema_error(
                        error_type="invalid_response_json",
                        provider_message="invalid JSON payload from model provider",
                        raw_error_redacted=sanitize_provider_error_detail(
                            raw_payload.decode("utf-8", errors="replace"),
                            api_key=readiness.api_key,
                        ),
                    ),
                    completed_at=completed_at,
                    latency_ms=latency_ms,
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc
        except Exception as exc:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_model_gateway_bug(exc, api_key=readiness.api_key),
                    completed_at=completed_at,
                    latency_ms=latency_ms,
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            ) from exc

        output_text = _extract_output_text(payload_object)
        if output_text is None:
            raise ModelGatewayInvocationError(
                build_failed_model_call(
                    failure=classify_response_schema_error(
                        error_type="invalid_response_schema",
                        provider_message="missing choices[0].message.content in provider response",
                        raw_error_redacted=sanitize_provider_error_detail(
                            raw_payload.decode("utf-8", errors="replace"),
                            api_key=readiness.api_key,
                        ),
                    ),
                    completed_at=completed_at,
                    latency_ms=latency_ms,
                    model_call_id=model_call_id,
                    model_id=readiness.model,
                    prompt_version_id=prompt_version_id,
                    provider=readiness.provider,
                    run_id=run_id,
                    started_at=started_at,
                )
            )

        prompt_tokens, completion_tokens = _extract_usage(payload_object)
        model_call: ModelCallRecord = {
            "modelCallId": model_call_id,
            "runId": run_id,
            "provider": readiness.provider,
            "modelId": readiness.model,
            "promptVersionId": prompt_version_id,
            "inputTokens": prompt_tokens,
            "outputTokens": completion_tokens,
            "cost": 0.0,
            "latencyMs": latency_ms,
            "status": "succeeded",
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
            "completedAt": completed_at,
        }
        return ModelGenerationResult(model_call=model_call, output_text=output_text)


def _extract_usage(payload: dict[str, object]) -> tuple[int, int]:
    usage = payload.get("usage")
    if not isinstance(usage, dict):
        return (0, 0)

    prompt_tokens = usage.get("prompt_tokens")
    completion_tokens = usage.get("completion_tokens")
    return (
        prompt_tokens if isinstance(prompt_tokens, int) else 0,
        completion_tokens if isinstance(completion_tokens, int) else 0,
    )


def _extract_output_text(payload: dict[str, object]) -> str | None:
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices:
        return None
    first_choice = choices[0]
    if not isinstance(first_choice, dict):
        return None
    message = first_choice.get("message")
    if not isinstance(message, dict):
        return None
    content = message.get("content")
    if isinstance(content, str) and content.strip():
        return content.strip()
    reasoning_content = message.get("reasoning_content")
    if isinstance(reasoning_content, str) and reasoning_content.strip():
        return reasoning_content.strip()
    if isinstance(content, list):
        text_parts = [
            item.get("text", "")
            for item in content
            if isinstance(item, dict) and isinstance(item.get("text"), str)
        ]
        joined_text = "".join(text_parts).strip()
        if joined_text:
            return joined_text
    return None


def _latency_ms(started_counter: float) -> int:
    return max(int((time.perf_counter() - started_counter) * 1000), 0)


def _current_completed_at(started_at: str) -> str:
    _ = started_at
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


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
            "failureClass": None,
            "httpStatus": None,
            "providerErrorCode": None,
            "providerRequestId": None,
            "timeoutMs": None,
            "retryable": None,
            "retryAfterMs": None,
            "rawErrorRedacted": None,
            "startedAt": occurred_at,
            "completedAt": occurred_at,
        }
        _ = tool_conclusion
        return FoundationModelGeneration(
            model_call=model_call,
            assistant_content=assistant_content,
        )
