"""Provider config readiness and real smoke helpers for Model Gateway."""

from __future__ import annotations

import json
import ssl
import time
from dataclasses import dataclass, field
from typing import Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request
from urllib.request import urlopen as urllib_urlopen

import certifi
from src.app.config import ModelGatewaySettings, ModelProviderSettings, Settings
from src.infrastructure.model_gateway.errors import ModelGatewayConfigurationError
from src.infrastructure.model_gateway.failure_taxonomy import (
    classify_http_error,
    classify_model_gateway_bug,
    classify_response_schema_error,
    classify_transport_error,
    suggested_action_for_failure_class,
)
from src.infrastructure.model_gateway.routing import (
    SUPPORTED_MODEL_API_FORMATS,
    resolve_model_provider,
)


@dataclass(frozen=True, slots=True)
class ModelProviderReadinessReport:
    provider: str
    api_format: str
    model: str
    base_url: str
    chat_completions_path: str
    chat_completions_url: str
    api_key: str = field(repr=False)
    api_key_status: str


@dataclass(frozen=True, slots=True)
class ModelProviderSmokeResult:
    provider: str
    model: str
    base_url: str
    api_key_status: str
    status: str
    latency_ms: int
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
    failure_class: str | None = None
    error_type: str | None = None
    safe_error_message: str | None = None
    http_status: int | None = None
    provider_error_code: str | None = None
    provider_request_id: str | None = None
    timeout_ms: int | None = None
    retryable: bool | None = None
    retry_after_ms: int | None = None
    raw_error_redacted: str | None = None
    suggested_action: str | None = None

    @property
    def exit_code(self) -> int:
        if self.status == "ok":
            return 0
        if self.failure_class == "provider_auth_error":
            return 3
        if self.failure_class in {
            "provider_timeout",
            "provider_network_error",
            "provider_cert_error",
            "provider_rate_limit",
            "provider_5xx",
        }:
            return 4
        return 5


class UrlopenCallable(Protocol):
    def __call__(
        self,
        request: Request,
        timeout: float,
        context: ssl.SSLContext,
    ) -> ResponseLike:
        ...


class ResponseLike(Protocol):
    status: int

    def read(self) -> bytes:
        ...

    def __enter__(self) -> ResponseLike:
        ...

    def __exit__(self, exc_type: object, exc: object, tb: object) -> bool | None:
        ...


def _model_gateway_settings(settings: Settings | ModelGatewaySettings) -> ModelGatewaySettings:
    if isinstance(settings, Settings):
        return settings.model_gateway
    return settings


def _require_field(
    provider: ModelProviderSettings,
    *,
    field_name: str,
    value: str,
) -> str:
    if value:
        return value
    raise ModelGatewayConfigurationError(
        "missing_config",
        f"provider={provider.name}; field={field_name}",
    )


def _validate_base_url(
    provider: ModelProviderSettings,
    *,
    base_url: str,
    chat_completions_path: str,
) -> str:
    parsed = urlsplit(base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ModelGatewayConfigurationError(
            "invalid_base_url",
            f"provider={provider.name}; base_url={base_url or '<missing>'}",
        )

    if base_url.rstrip("/").endswith(chat_completions_path.rstrip("/")):
        raise ModelGatewayConfigurationError(
            "invalid_base_url",
            f"provider={provider.name}; duplicated_chat_path=true",
        )

    return base_url.rstrip("/")


def _join_chat_completions_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


def build_model_provider_readiness_report(
    settings: Settings | ModelGatewaySettings,
    provider_name: str | None = None,
) -> ModelProviderReadinessReport:
    model_gateway_settings = _model_gateway_settings(settings)
    provider = resolve_model_provider(model_gateway_settings, provider_name)

    api_format = _require_field(
        provider,
        field_name="api_format",
        value=provider.api_format,
    )
    if api_format not in SUPPORTED_MODEL_API_FORMATS:
        raise ModelGatewayConfigurationError(
            "unsupported_api_format",
            f"provider={provider.name}; api_format={api_format}",
        )

    chat_completions_path = _require_field(
        provider,
        field_name="chat_completions_path",
        value=provider.chat_completions_path,
    )
    base_url = _validate_base_url(
        provider,
        base_url=_require_field(
            provider,
            field_name="base_url",
            value=provider.base_url,
        ),
        chat_completions_path=chat_completions_path,
    )
    model = _require_field(
        provider,
        field_name="default_model",
        value=provider.default_model,
    )

    if not provider.api_key:
        raise ModelGatewayConfigurationError(
            "missing_api_key",
            f"provider={provider.name}; api_key=missing",
        )

    return ModelProviderReadinessReport(
        provider=provider.name,
        api_format=api_format,
        model=model,
        base_url=base_url,
        chat_completions_path=chat_completions_path,
        chat_completions_url=_join_chat_completions_url(base_url, chat_completions_path),
        api_key=provider.api_key,
        api_key_status="configured",
    )


def _extract_usage(
    payload: dict[str, object],
) -> tuple[int | None, int | None, int | None]:
    usage = payload.get("usage")
    if not isinstance(usage, dict):
        return (None, None, None)

    prompt_tokens = usage.get("prompt_tokens")
    completion_tokens = usage.get("completion_tokens")
    total_tokens = usage.get("total_tokens")
    return (
        prompt_tokens if isinstance(prompt_tokens, int) else None,
        completion_tokens if isinstance(completion_tokens, int) else None,
        total_tokens if isinstance(total_tokens, int) else None,
    )


def build_model_provider_tls_context() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def run_provider_smoke(
    readiness: ModelProviderReadinessReport,
    *,
    timeout_ms: int,
    max_tokens: int = 16,
    temperature: float = 0.0,
    enable_thinking: bool = False,
    urlopen: UrlopenCallable | None = None,
) -> ModelProviderSmokeResult:
    _ = enable_thinking
    urlopen_callable = urllib_urlopen if urlopen is None else urlopen
    tls_context = build_model_provider_tls_context()
    payload = {
        "model": readiness.model,
        "messages": [{"role": "user", "content": "Reply with OK."}],
        "max_tokens": min(max_tokens, 32),
        "temperature": temperature,
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

    started_at = time.perf_counter()
    try:
        with urlopen_callable(
            request,
            timeout=timeout_ms / 1000,
            context=tls_context,
        ) as response:
            raw_body = response.read().decode("utf-8")
            decoded_payload = json.loads(raw_body)
            if not isinstance(decoded_payload, dict):
                raise ValueError("response_payload_must_be_object")

        latency_ms = int((time.perf_counter() - started_at) * 1000)
        prompt_tokens, completion_tokens, total_tokens = _extract_usage(decoded_payload)
        return ModelProviderSmokeResult(
            provider=readiness.provider,
            model=readiness.model,
            base_url=readiness.base_url,
            api_key_status=readiness.api_key_status,
            status="ok",
            latency_ms=latency_ms,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
        )
    except HTTPError as exc:
        latency_ms = int((time.perf_counter() - started_at) * 1000)
        failure = classify_http_error(
            exc,
            api_key=readiness.api_key,
            timeout_ms=timeout_ms,
        )
        return ModelProviderSmokeResult(
            provider=readiness.provider,
            model=readiness.model,
            base_url=readiness.base_url,
            api_key_status=readiness.api_key_status,
            status="failed",
            latency_ms=latency_ms,
            failure_class=failure.failure_class,
            error_type=failure.error_type,
            safe_error_message=failure.safe_error_message,
            http_status=failure.http_status,
            provider_error_code=failure.provider_error_code,
            provider_request_id=failure.provider_request_id,
            timeout_ms=failure.timeout_ms,
            retryable=failure.retryable,
            retry_after_ms=failure.retry_after_ms,
            raw_error_redacted=failure.raw_error_redacted,
            suggested_action=suggested_action_for_failure_class(
                failure.failure_class,
                retryable=failure.retryable,
                error_type=failure.error_type,
            ),
        )
    except (URLError, TimeoutError, OSError) as exc:
        latency_ms = int((time.perf_counter() - started_at) * 1000)
        failure = classify_transport_error(
            exc,
            api_key=readiness.api_key,
            timeout_ms=timeout_ms,
        )
        return ModelProviderSmokeResult(
            provider=readiness.provider,
            model=readiness.model,
            base_url=readiness.base_url,
            api_key_status=readiness.api_key_status,
            status="failed",
            latency_ms=latency_ms,
            failure_class=failure.failure_class,
            error_type=failure.error_type,
            safe_error_message=failure.safe_error_message,
            http_status=failure.http_status,
            provider_error_code=failure.provider_error_code,
            provider_request_id=failure.provider_request_id,
            timeout_ms=failure.timeout_ms,
            retryable=failure.retryable,
            retry_after_ms=failure.retry_after_ms,
            raw_error_redacted=failure.raw_error_redacted,
            suggested_action=suggested_action_for_failure_class(
                failure.failure_class,
                retryable=failure.retryable,
                error_type=failure.error_type,
            ),
        )
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        latency_ms = int((time.perf_counter() - started_at) * 1000)
        failure = classify_response_schema_error(
            error_type="invalid_response_json",
            provider_message="invalid JSON payload from model provider",
            raw_error_redacted=str(exc),
        )
        return ModelProviderSmokeResult(
            provider=readiness.provider,
            model=readiness.model,
            base_url=readiness.base_url,
            api_key_status=readiness.api_key_status,
            status="failed",
            latency_ms=latency_ms,
            failure_class=failure.failure_class,
            error_type=failure.error_type,
            safe_error_message=failure.safe_error_message,
            http_status=failure.http_status,
            provider_error_code=failure.provider_error_code,
            provider_request_id=failure.provider_request_id,
            timeout_ms=failure.timeout_ms,
            retryable=failure.retryable,
            retry_after_ms=failure.retry_after_ms,
            raw_error_redacted=failure.raw_error_redacted,
            suggested_action=suggested_action_for_failure_class(
                failure.failure_class,
                retryable=failure.retryable,
                error_type=failure.error_type,
            ),
        )
    except Exception as exc:
        latency_ms = int((time.perf_counter() - started_at) * 1000)
        failure = classify_model_gateway_bug(exc, api_key=readiness.api_key)
        return ModelProviderSmokeResult(
            provider=readiness.provider,
            model=readiness.model,
            base_url=readiness.base_url,
            api_key_status=readiness.api_key_status,
            status="failed",
            latency_ms=latency_ms,
            failure_class=failure.failure_class,
            error_type=failure.error_type,
            safe_error_message=failure.safe_error_message,
            http_status=failure.http_status,
            provider_error_code=failure.provider_error_code,
            provider_request_id=failure.provider_request_id,
            timeout_ms=failure.timeout_ms,
            retryable=failure.retryable,
            retry_after_ms=failure.retry_after_ms,
            raw_error_redacted=failure.raw_error_redacted,
            suggested_action=suggested_action_for_failure_class(
                failure.failure_class,
                retryable=failure.retryable,
                error_type=failure.error_type,
            ),
        )
