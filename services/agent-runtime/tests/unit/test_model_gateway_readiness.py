from __future__ import annotations

import io
import json
import ssl
from http.client import HTTPMessage
from typing import Literal, cast
from urllib.error import HTTPError, URLError
from urllib.request import Request

import certifi
import pytest
from src.app.config import get_settings
from src.infrastructure.model_gateway import readiness as readiness_module
from src.infrastructure.model_gateway.errors import ModelGatewayConfigurationError
from src.infrastructure.model_gateway.readiness import (
    build_model_provider_readiness_report,
    run_provider_smoke,
)


def configure_real_provider_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IAP_MODEL_ACTIVE_PROVIDER", "siliconflow")
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT",
        "openai_chat_completions",
    )
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_BASE_URL",
        "https://api.siliconflow.cn/v1",
    )
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_CHAT_COMPLETIONS_PATH",
        "/chat/completions",
    )
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_DEFAULT_MODEL",
        "Qwen/Qwen3.5-4B",
    )
    monkeypatch.setenv("IAP_MODEL_PROVIDER_SILICONFLOW_API_KEY", "siliconflow-secret")
    monkeypatch.setenv("IAP_MODEL_PROVIDER_ZHIPU_API_FORMAT", "openai_chat_completions")
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_ZHIPU_BASE_URL",
        "https://open.bigmodel.cn/api/paas/v4",
    )
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_ZHIPU_CHAT_COMPLETIONS_PATH",
        "/chat/completions",
    )
    monkeypatch.setenv("IAP_MODEL_PROVIDER_ZHIPU_DEFAULT_MODEL", "GLM-4.7-Flash")
    monkeypatch.setenv("IAP_MODEL_PROVIDER_ZHIPU_API_KEY", "zhipu-secret")
    monkeypatch.setenv("IAP_MODEL_MAX_TOKENS", "512")
    monkeypatch.setenv("IAP_MODEL_TIMEOUT_MS", "30000")
    monkeypatch.setenv("IAP_MODEL_TEMPERATURE", "0.2")
    monkeypatch.setenv("IAP_MODEL_ENABLE_THINKING", "false")
    monkeypatch.setenv("IAP_MODEL_REAL_API_REQUIRED", "true")
    get_settings.cache_clear()


class FakeResponse:
    def __init__(self, payload: dict[str, object], *, status: int = 200) -> None:
        self.status = status
        self._payload = json.dumps(payload).encode("utf-8")

    def read(self) -> bytes:
        return self._payload

    def __enter__(self) -> FakeResponse:
        return self

    def __exit__(self, exc_type: object, exc: object, tb: object) -> Literal[False]:
        return False


def test_get_settings_reads_model_provider_configuration(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)

    settings = get_settings()
    provider = settings.model_gateway.provider("siliconflow")

    assert settings.model_gateway.active_provider == "siliconflow"
    assert provider is not None
    assert provider.base_url == "https://api.siliconflow.cn/v1"
    assert provider.chat_completions_path == "/chat/completions"
    assert provider.default_model == "Qwen/Qwen3.5-4B"
    assert settings.model_gateway.max_tokens == 512
    assert settings.model_gateway.timeout_ms == 30000
    assert settings.model_gateway.temperature == 0.2
    assert settings.model_gateway.enable_thinking is False
    assert settings.model_gateway.real_api_required is True


def test_build_model_provider_readiness_masks_api_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)

    readiness = build_model_provider_readiness_report(get_settings())

    assert readiness.provider == "siliconflow"
    assert readiness.model == "Qwen/Qwen3.5-4B"
    assert readiness.base_url == "https://api.siliconflow.cn/v1"
    assert readiness.chat_completions_url == "https://api.siliconflow.cn/v1/chat/completions"
    assert readiness.api_key_status == "configured"


def test_build_model_provider_readiness_repr_hides_api_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)

    readiness = build_model_provider_readiness_report(get_settings())
    readiness_repr = repr(readiness)

    assert "siliconflow-secret" not in readiness_repr
    assert "api_key=" not in readiness_repr
    assert readiness.api_key_status == "configured"


def test_build_model_provider_tls_context_uses_certifi_bundle(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, object] = {}
    expected_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)

    monkeypatch.setattr(certifi, "where", lambda: "/tmp/test-certifi.pem")

    def fake_create_default_context(*, cafile: str | None = None) -> ssl.SSLContext:
        captured["cafile"] = cafile
        return expected_context

    monkeypatch.setattr(ssl, "create_default_context", fake_create_default_context)

    context = readiness_module.build_model_provider_tls_context()

    assert context is expected_context
    assert captured["cafile"] == "/tmp/test-certifi.pem"


def test_build_model_provider_readiness_rejects_missing_api_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    monkeypatch.setenv("IAP_MODEL_PROVIDER_SILICONFLOW_API_KEY", "")
    get_settings.cache_clear()

    with pytest.raises(ModelGatewayConfigurationError) as exc_info:
        build_model_provider_readiness_report(get_settings())

    assert exc_info.value.code == "missing_api_key"


def test_build_model_provider_readiness_rejects_unsupported_format(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    monkeypatch.setenv("IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT", "responses_api")
    get_settings.cache_clear()

    with pytest.raises(ModelGatewayConfigurationError) as exc_info:
        build_model_provider_readiness_report(get_settings())

    assert exc_info.value.code == "unsupported_api_format"


def test_build_model_provider_readiness_rejects_invalid_base_url(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    monkeypatch.setenv("IAP_MODEL_ACTIVE_PROVIDER", "zhipu")
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_ZHIPU_BASE_URL",
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    )
    get_settings.cache_clear()

    with pytest.raises(ModelGatewayConfigurationError) as exc_info:
        build_model_provider_readiness_report(get_settings())

    assert exc_info.value.code == "invalid_base_url"


def test_run_provider_smoke_reports_masked_success(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    readiness = build_model_provider_readiness_report(get_settings())

    captured_request: dict[str, object] = {}
    expected_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)

    monkeypatch.setattr(
        readiness_module,
        "build_model_provider_tls_context",
        lambda: expected_context,
    )

    def fake_urlopen(request: object, timeout: float, context: ssl.SSLContext) -> FakeResponse:
        captured_request["request"] = request
        captured_request["timeout"] = timeout
        captured_request["context"] = context
        return FakeResponse(
            {
                "usage": {
                    "prompt_tokens": 11,
                    "completion_tokens": 7,
                    "total_tokens": 18,
                }
            }
        )

    result = run_provider_smoke(readiness, timeout_ms=30000, urlopen=fake_urlopen)

    request = cast(Request, captured_request["request"])
    assert request.full_url == "https://api.siliconflow.cn/v1/chat/completions"
    assert request.get_header("Authorization") == "Bearer siliconflow-secret"
    assert captured_request["timeout"] == 30.0
    assert captured_request["context"] is expected_context
    assert result.status == "ok"
    assert result.api_key_status == "configured"
    assert result.prompt_tokens == 11
    assert result.completion_tokens == 7
    assert result.total_tokens == 18
    assert result.failure_class is None
    assert result.retryable is None


def test_run_provider_smoke_classifies_auth_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    readiness = build_model_provider_readiness_report(get_settings())

    def fake_urlopen(request: object, timeout: float, context: ssl.SSLContext) -> FakeResponse:
        del request, timeout, context
        raise HTTPError(
            readiness.chat_completions_url,
            401,
            "Unauthorized",
            hdrs=HTTPMessage(),
            fp=io.BytesIO(b'{"error":{"message":"unauthorized"}}'),
        )

    result = run_provider_smoke(readiness, timeout_ms=30000, urlopen=fake_urlopen)

    assert result.status == "failed"
    assert result.failure_class == "provider_auth_error"
    assert result.error_type == "http_401"
    assert result.http_status == 401
    assert result.safe_error_message == "unauthorized"
    assert result.api_key_status == "configured"
    assert result.total_tokens is None
    assert result.retryable is False
    assert result.suggested_action == "fix_provider_env_or_configuration"


def test_run_provider_smoke_sanitizes_network_error_detail(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    readiness = build_model_provider_readiness_report(get_settings())

    def fake_urlopen(request: object, timeout: float, context: ssl.SSLContext) -> FakeResponse:
        del request, timeout, context
        raise URLError(
            "Authorization Bearer siliconflow-secret " + ("x" * 300),
        )

    result = run_provider_smoke(readiness, timeout_ms=30000, urlopen=fake_urlopen)

    assert result.status == "failed"
    assert result.failure_class == "provider_network_error"
    assert result.error_type == "network_error"
    assert result.raw_error_redacted is not None
    assert "siliconflow-secret" not in result.raw_error_redacted
    assert "Authorization" not in result.raw_error_redacted
    assert len(result.raw_error_redacted) <= 500
    assert result.retryable is True
    assert result.suggested_action == "retry_and_compare_baseline_provider_health"


def test_run_provider_smoke_classifies_quota_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    readiness = build_model_provider_readiness_report(get_settings())

    def fake_urlopen(request: object, timeout: float, context: ssl.SSLContext) -> FakeResponse:
        del request, timeout, context
        raise HTTPError(
            readiness.chat_completions_url,
            429,
            "Too Many Requests",
            hdrs=HTTPMessage(),
            fp=io.BytesIO(
                b'{"error":{"message":"insufficient quota for current account",'
                b'"code":"insufficient_quota"}}'
            ),
        )

    result = run_provider_smoke(readiness, timeout_ms=30000, urlopen=fake_urlopen)

    assert result.failure_class == "provider_quota_error"
    assert result.retryable is False


def test_run_provider_smoke_classifies_certificate_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    readiness = build_model_provider_readiness_report(get_settings())

    def fake_urlopen(request: object, timeout: float, context: ssl.SSLContext) -> FakeResponse:
        del request, timeout, context
        raise URLError(ssl.SSLCertVerificationError("certificate verify failed"))

    result = run_provider_smoke(readiness, timeout_ms=30000, urlopen=fake_urlopen)

    assert result.failure_class == "provider_cert_error"
    assert result.retryable is False
