from __future__ import annotations

import io
import json
from http.client import HTTPMessage
from typing import Literal, cast
from urllib.error import HTTPError
from urllib.request import Request

import pytest
from src.app.config import get_settings
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

    def fake_urlopen(request: object, timeout: float) -> FakeResponse:
        captured_request["request"] = request
        captured_request["timeout"] = timeout
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
    assert result.status == "ok"
    assert result.api_key_status == "configured"
    assert result.prompt_tokens == 11
    assert result.completion_tokens == 7
    assert result.total_tokens == 18


def test_run_provider_smoke_classifies_auth_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_real_provider_env(monkeypatch)
    readiness = build_model_provider_readiness_report(get_settings())

    def fake_urlopen(request: object, timeout: float) -> FakeResponse:
        del request, timeout
        raise HTTPError(
            readiness.chat_completions_url,
            401,
            "Unauthorized",
            hdrs=HTTPMessage(),
            fp=io.BytesIO(b'{"error":{"message":"unauthorized"}}'),
        )

    result = run_provider_smoke(readiness, timeout_ms=30000, urlopen=fake_urlopen)

    assert result.status == "auth_error"
    assert result.api_key_status == "configured"
    assert result.total_tokens is None
