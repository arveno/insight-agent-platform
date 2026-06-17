from __future__ import annotations

import json
import re
import socket
import ssl
from dataclasses import dataclass
from email.message import Message
from typing import Literal, cast
from urllib.error import HTTPError, URLError

from src.infrastructure.database.runtime_foundation import ModelCallRecord
from src.infrastructure.model_gateway.errors import ModelGatewayConfigurationError

ModelGatewayFailureClass = Literal[
    "provider_auth_error",
    "provider_rate_limit",
    "provider_quota_error",
    "provider_timeout",
    "provider_network_error",
    "provider_cert_error",
    "provider_model_not_found",
    "provider_5xx",
    "provider_response_schema_error",
    "model_gateway_bug",
    "worker_integration_bug",
    "unknown",
]

RETRYABLE_FAILURE_CLASSES = frozenset(
    {
        "provider_timeout",
        "provider_network_error",
        "provider_5xx",
        "provider_rate_limit",
    }
)
REQUEST_ID_HEADER_NAMES = (
    "x-request-id",
    "request-id",
    "x-amzn-requestid",
    "openai-request-id",
)
AUTH_KEYWORDS = (
    "unauthorized",
    "authentication",
    "invalid api key",
    "forbidden",
    "permission denied",
    "access token",
)
QUOTA_KEYWORDS = (
    "quota",
    "insufficient balance",
    "insufficient_balance",
    "insufficient credits",
    "insufficient_credits",
    "insufficient quota",
    "quota exceeded",
    "credit balance",
    "余额不足",
)
RATE_LIMIT_KEYWORDS = (
    "rate limit",
    "too many requests",
    "rate_limit",
    "throttle",
    "throttled",
)
MODEL_NOT_FOUND_KEYWORDS = (
    "model not found",
    "model_not_found",
    "invalid model",
    "unknown model",
    "no such model",
    "does not exist",
)
CERTIFICATE_KEYWORDS = (
    "certificate verify failed",
    "self signed certificate",
    "sslcertverificationerror",
)
TIMEOUT_KEYWORDS = (
    "timed out",
    "timeout",
    "read operation timed out",
    "read timed out",
)
SAFE_SUMMARY_BY_FAILURE_CLASS: dict[ModelGatewayFailureClass, str] = {
    "provider_auth_error": "Provider authentication failed.",
    "provider_rate_limit": "Provider rate limit blocked the model request.",
    "provider_quota_error": "Provider quota blocked the model request.",
    "provider_timeout": "Provider request timed out.",
    "provider_network_error": "Provider network communication failed.",
    "provider_cert_error": "Provider TLS or certificate validation failed.",
    "provider_model_not_found": "Provider rejected the configured model identifier.",
    "provider_5xx": "Provider returned a server-side failure.",
    "provider_response_schema_error": "Provider response did not match the expected schema.",
    "model_gateway_bug": "Model Gateway failed before it could produce a valid provider result.",
    "worker_integration_bug": "Worker integration failed while invoking Model Gateway.",
    "unknown": "Model execution failed for an unknown reason.",
}


@dataclass(frozen=True, slots=True)
class ModelGatewayFailureDetails:
    failure_class: ModelGatewayFailureClass
    error_type: str
    safe_error_message: str
    raw_error_redacted: str | None
    http_status: int | None
    provider_error_code: str | None
    provider_request_id: str | None
    timeout_ms: int | None
    retryable: bool
    retry_after_ms: int | None


def sanitize_provider_error_detail(detail: object, *, api_key: str) -> str:
    sanitized = str(detail)
    if api_key:
        sanitized = sanitized.replace(api_key, "[redacted]")
    sanitized = re.sub(
        r"(IAP_[A-Z0-9_]*API_KEY)\s*=\s*[^\s;]+",
        r"\1=[redacted]",
        sanitized,
        flags=re.IGNORECASE,
    )
    sanitized = re.sub(
        r"\.env\.model\.local",
        "[redacted-env-file]",
        sanitized,
        flags=re.IGNORECASE,
    )
    sanitized = re.sub(
        r"Authorization\b[:\s]+[^\r\n]*",
        "[redacted-header]",
        sanitized,
        flags=re.IGNORECASE,
    )
    sanitized = re.sub(
        r"Bearer\s+[A-Za-z0-9._~+/=-]+",
        "[redacted-token]",
        sanitized,
        flags=re.IGNORECASE,
    )
    sanitized = re.sub(r"\s+", " ", sanitized).strip()
    return sanitized[:500]


def classify_configuration_error(
    exc: ModelGatewayConfigurationError,
    *,
    api_key: str,
) -> ModelGatewayFailureDetails:
    detail = sanitize_provider_error_detail(exc.detail, api_key=api_key)
    failure_class = _classify_configuration_failure(exc.code)
    return _build_failure_details(
        failure_class=failure_class,
        error_type=f"configuration_{exc.code}",
        provider_message=detail,
        raw_error_redacted=detail,
        http_status=None,
        provider_error_code=_sanitize_provider_metadata_value(
            exc.code,
            api_key=api_key,
            max_length=64,
        ),
        provider_request_id=None,
        timeout_ms=None,
        retry_after_ms=None,
    )


def classify_http_error(
    exc: HTTPError,
    *,
    api_key: str,
    timeout_ms: int,
) -> ModelGatewayFailureDetails:
    detail = _read_http_error_detail(exc)
    payload = _extract_provider_error_payload(detail)
    sanitized_payload_message = (
        sanitize_provider_error_detail(payload.message, api_key=api_key)
        if payload.message
        else None
    )
    combined_detail = sanitized_payload_message or sanitize_provider_error_detail(
        detail,
        api_key=api_key,
    )
    headers = cast(Message | None, getattr(exc, "headers", None) or getattr(exc, "hdrs", None))
    failure_class = _classify_http_failure(
        http_status=exc.code,
        provider_message=combined_detail,
        provider_error_code=payload.code,
    )
    return _build_failure_details(
        failure_class=failure_class,
        error_type=f"http_{exc.code}",
        provider_message=combined_detail,
        raw_error_redacted=sanitize_provider_error_detail(detail, api_key=api_key),
        http_status=exc.code,
        provider_error_code=_sanitize_provider_metadata_value(
            payload.code,
            api_key=api_key,
            max_length=128,
        ),
        provider_request_id=_sanitize_provider_metadata_value(
            payload.request_id or _extract_request_id(headers),
            api_key=api_key,
            max_length=128,
        ),
        timeout_ms=timeout_ms if failure_class == "provider_timeout" else None,
        retry_after_ms=_parse_retry_after_ms(headers),
    )


def classify_transport_error(
    exc: URLError | OSError,
    *,
    api_key: str,
    timeout_ms: int,
) -> ModelGatewayFailureDetails:
    reason = exc.reason if isinstance(exc, URLError) else exc
    sanitized_detail = sanitize_provider_error_detail(reason, api_key=api_key)
    failure_class = _classify_transport_failure(reason)
    error_type = {
        "provider_timeout": "timeout_error",
        "provider_cert_error": "ssl_cert_verification_error",
    }.get(failure_class, "network_error")
    return _build_failure_details(
        failure_class=failure_class,
        error_type=error_type,
        provider_message=sanitized_detail,
        raw_error_redacted=sanitized_detail,
        http_status=None,
        provider_error_code=None,
        provider_request_id=None,
        timeout_ms=timeout_ms if failure_class == "provider_timeout" else None,
        retry_after_ms=None,
    )


def classify_response_schema_error(
    *,
    error_type: str,
    provider_message: str,
    raw_error_redacted: str | None,
) -> ModelGatewayFailureDetails:
    return _build_failure_details(
        failure_class="provider_response_schema_error",
        error_type=error_type,
        provider_message=provider_message,
        raw_error_redacted=raw_error_redacted,
        http_status=None,
        provider_error_code=None,
        provider_request_id=None,
        timeout_ms=None,
        retry_after_ms=None,
    )


def classify_model_gateway_bug(
    exc: Exception,
    *,
    api_key: str,
) -> ModelGatewayFailureDetails:
    detail = sanitize_provider_error_detail(str(exc), api_key=api_key)
    return _build_failure_details(
        failure_class="model_gateway_bug",
        error_type="unexpected_gateway_exception",
        provider_message=detail or type(exc).__name__,
        raw_error_redacted=detail,
        http_status=None,
        provider_error_code=None,
        provider_request_id=None,
        timeout_ms=None,
        retry_after_ms=None,
    )


def classify_worker_integration_bug(
    exc: Exception,
    *,
    api_key: str,
) -> ModelGatewayFailureDetails:
    detail = sanitize_provider_error_detail(str(exc), api_key=api_key)
    return _build_failure_details(
        failure_class="worker_integration_bug",
        error_type="worker_integration_error",
        provider_message=detail or type(exc).__name__,
        raw_error_redacted=detail,
        http_status=None,
        provider_error_code=None,
        provider_request_id=None,
        timeout_ms=None,
        retry_after_ms=None,
    )


def classify_unknown_failure(
    exc: Exception,
    *,
    api_key: str,
) -> ModelGatewayFailureDetails:
    detail = sanitize_provider_error_detail(str(exc), api_key=api_key)
    return _build_failure_details(
        failure_class="unknown",
        error_type=type(exc).__name__.lower(),
        provider_message=detail or type(exc).__name__,
        raw_error_redacted=detail,
        http_status=None,
        provider_error_code=None,
        provider_request_id=None,
        timeout_ms=None,
        retry_after_ms=None,
    )


def build_failed_model_call(
    *,
    failure: ModelGatewayFailureDetails,
    completed_at: str,
    latency_ms: int,
    model_call_id: str,
    model_id: str,
    prompt_version_id: str,
    provider: str,
    run_id: str,
    started_at: str,
) -> ModelCallRecord:
    return {
        "modelCallId": model_call_id,
        "runId": run_id,
        "provider": provider,
        "modelId": model_id,
        "promptVersionId": prompt_version_id,
        "inputTokens": 0,
        "outputTokens": 0,
        "cost": 0.0,
        "latencyMs": latency_ms,
        "status": "failed",
        "errorType": failure.error_type,
        "errorMessage": failure.safe_error_message,
        "failureClass": failure.failure_class,
        "httpStatus": failure.http_status,
        "providerErrorCode": failure.provider_error_code,
        "providerRequestId": failure.provider_request_id,
        "timeoutMs": failure.timeout_ms,
        "retryable": failure.retryable,
        "retryAfterMs": failure.retry_after_ms,
        "rawErrorRedacted": failure.raw_error_redacted,
        "startedAt": started_at,
        "completedAt": completed_at,
    }


def suggested_action_for_failure_class(
    failure_class: str,
    *,
    retryable: bool,
    error_type: str | None = None,
) -> str:
    if error_type is not None and error_type.startswith("configuration_"):
        return "fix_provider_env_or_configuration"
    if failure_class in {"provider_auth_error", "provider_quota_error", "provider_model_not_found"}:
        return "fix_provider_env_or_configuration"
    if failure_class in {
        "provider_timeout",
        "provider_network_error",
        "provider_rate_limit",
        "provider_5xx",
        "provider_cert_error",
    }:
        return "retry_and_compare_baseline_provider_health"
    if failure_class in {
        "provider_response_schema_error",
        "model_gateway_bug",
        "worker_integration_bug",
    }:
        return "inspect_runtime_code_and_provider_contract"
    if retryable:
        return "retry_with_structured_diagnostics"
    return "collect_diagnostics_and_compare_baseline"


def _build_failure_details(
    *,
    failure_class: ModelGatewayFailureClass,
    error_type: str,
    provider_message: str | None,
    raw_error_redacted: str | None,
    http_status: int | None,
    provider_error_code: str | None,
    provider_request_id: str | None,
    timeout_ms: int | None,
    retry_after_ms: int | None,
) -> ModelGatewayFailureDetails:
    safe_message = provider_message or SAFE_SUMMARY_BY_FAILURE_CLASS[failure_class]
    safe_message = safe_message[:240]
    return ModelGatewayFailureDetails(
        failure_class=failure_class,
        error_type=error_type,
        safe_error_message=safe_message,
        raw_error_redacted=raw_error_redacted,
        http_status=http_status,
        provider_error_code=provider_error_code,
        provider_request_id=provider_request_id,
        timeout_ms=timeout_ms,
        retryable=failure_class in RETRYABLE_FAILURE_CLASSES,
        retry_after_ms=retry_after_ms,
    )


def _classify_configuration_failure(code: str) -> ModelGatewayFailureClass:
    if code == "missing_api_key":
        return "provider_auth_error"
    return "model_gateway_bug"


def _classify_http_failure(
    *,
    http_status: int,
    provider_message: str,
    provider_error_code: str | None,
) -> ModelGatewayFailureClass:
    haystack = f"{provider_error_code or ''} {provider_message}".lower()
    if _contains_keyword(haystack, QUOTA_KEYWORDS):
        return "provider_quota_error"
    if http_status == 429:
        return "provider_rate_limit"
    if _contains_keyword(haystack, MODEL_NOT_FOUND_KEYWORDS) and http_status in {400, 404, 422}:
        return "provider_model_not_found"
    if http_status in {401, 403} or _contains_keyword(haystack, AUTH_KEYWORDS):
        return "provider_auth_error"
    if http_status == 408:
        return "provider_timeout"
    if 500 <= http_status <= 599:
        return "provider_5xx"
    if _contains_keyword(haystack, MODEL_NOT_FOUND_KEYWORDS):
        return "provider_model_not_found"
    return "unknown"


def _classify_transport_failure(reason: object) -> ModelGatewayFailureClass:
    if _is_certificate_error(reason):
        return "provider_cert_error"
    if _is_timeout_error(reason):
        return "provider_timeout"
    return "provider_network_error"


def _is_timeout_error(reason: object) -> bool:
    if isinstance(reason, (TimeoutError, socket.timeout)):
        return True
    return _contains_keyword(str(reason).lower(), TIMEOUT_KEYWORDS)


def _is_certificate_error(reason: object) -> bool:
    if isinstance(reason, ssl.SSLCertVerificationError):
        return True
    if isinstance(reason, ssl.SSLError):
        return _contains_keyword(str(reason).lower(), CERTIFICATE_KEYWORDS)
    return _contains_keyword(str(reason).lower(), CERTIFICATE_KEYWORDS)


def _contains_keyword(text: str, keywords: tuple[str, ...]) -> bool:
    return any(keyword in text for keyword in keywords)


@dataclass(frozen=True, slots=True)
class _ProviderErrorPayload:
    message: str | None
    code: str | None
    request_id: str | None


def _extract_provider_error_payload(detail: object) -> _ProviderErrorPayload:
    normalized_detail = str(detail).strip()
    try:
        payload = json.loads(normalized_detail)
    except json.JSONDecodeError:
        return _ProviderErrorPayload(message=normalized_detail or None, code=None, request_id=None)

    if not isinstance(payload, dict):
        return _ProviderErrorPayload(message=normalized_detail or None, code=None, request_id=None)

    error_object = payload.get("error")
    if isinstance(error_object, dict):
        message = _string_value(error_object.get("message")) or _string_value(
            payload.get("message")
        )
        code = _string_value(error_object.get("code")) or _string_value(error_object.get("type"))
        request_id = (
            _string_value(error_object.get("request_id"))
            or _string_value(payload.get("request_id"))
            or _string_value(payload.get("requestId"))
        )
        return _ProviderErrorPayload(message=message, code=code, request_id=request_id)

    return _ProviderErrorPayload(
        message=_string_value(payload.get("message")) or normalized_detail or None,
        code=_string_value(payload.get("code")),
        request_id=_string_value(payload.get("request_id"))
        or _string_value(payload.get("requestId")),
    )


def _string_value(value: object) -> str | None:
    return value if isinstance(value, str) and value.strip() else None


def _sanitize_provider_metadata_value(
    value: str | None,
    *,
    api_key: str,
    max_length: int,
) -> str | None:
    normalized_value = _string_value(value)
    if normalized_value is None:
        return None
    sanitized_value = sanitize_provider_error_detail(normalized_value, api_key=api_key)
    sanitized_value = re.sub(r"[^A-Za-z0-9._:/=\-\[\]]+", "-", sanitized_value)
    sanitized_value = re.sub(r"-{2,}", "-", sanitized_value).strip("-")
    return sanitized_value[:max_length] or None


def _extract_request_id(headers: Message | None) -> str | None:
    if headers is None:
        return None
    for header_name in REQUEST_ID_HEADER_NAMES:
        header_value = headers.get(header_name)
        if header_value:
            return header_value.strip()[:128]
    return None


def _parse_retry_after_ms(headers: Message | None) -> int | None:
    if headers is None:
        return None
    retry_after = headers.get("Retry-After")
    if retry_after is None:
        return None
    retry_after_seconds = retry_after.strip()
    if retry_after_seconds.isdigit():
        return int(retry_after_seconds) * 1000
    return None


def _read_http_error_detail(exc: HTTPError) -> str:
    if exc.fp is None:
        return exc.reason or exc.msg
    try:
        body = exc.fp.read()
    except OSError:
        return exc.reason or exc.msg
    if isinstance(body, bytes):
        try:
            return body.decode("utf-8")
        except UnicodeDecodeError:
            return exc.reason or exc.msg
    return str(body)
