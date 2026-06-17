from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
SMOKE_SCRIPT_PATH = REPO_ROOT / "scripts/smoke/model-provider-readiness.py"


def test_model_provider_readiness_smoke_script_exposes_masked_cli_surface() -> None:
    source = SMOKE_SCRIPT_PATH.read_text(encoding="utf-8")

    assert 'parser.add_argument("--env-file"' in source
    assert 'parser.add_argument("--provider"' in source
    assert "apiKey=" in source
    assert "failureClass=" in source
    assert "safeErrorMessage=" in source
    assert "suggestedAction=" in source
    assert "/opt/insight-agent-platform/env/model-provider.env" not in source


def test_model_provider_readiness_smoke_script_reports_missing_api_key(
    tmp_path: Path,
) -> None:
    env_file = tmp_path / "missing-api-key.env"
    env_file.write_text(
        "\n".join(
            [
                "IAP_MODEL_ACTIVE_PROVIDER=siliconflow",
                "IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT=openai_chat_completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1",
                "IAP_MODEL_PROVIDER_SILICONFLOW_CHAT_COMPLETIONS_PATH=/chat/completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_DEFAULT_MODEL=Qwen/Qwen3.5-4B",
                "IAP_MODEL_PROVIDER_SILICONFLOW_API_KEY=",
            ]
        ),
        encoding="utf-8",
    )

    result = subprocess.run(
        [sys.executable, str(SMOKE_SCRIPT_PATH), "--env-file", str(env_file)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        env=os.environ.copy(),
        check=False,
    )

    assert result.returncode == 2
    assert "provider=siliconflow" in result.stdout
    assert "model=Qwen/Qwen3.5-4B" in result.stdout
    assert "baseUrl=https://api.siliconflow.cn/v1" in result.stdout
    assert "apiFormat=openai_chat_completions" in result.stdout
    assert "apiKey=missing" in result.stdout
    assert "status=failed" in result.stdout
    assert "failureClass=provider_auth_error" in result.stdout
    assert "errorType=configuration_missing_api_key" in result.stdout
    assert "retryable=false" in result.stdout
    assert "suggestedAction=fix_provider_env_or_configuration" in result.stdout
    assert "safeErrorMessage=" in result.stdout
    assert "apiKey=configured" not in result.stdout


def test_model_provider_readiness_smoke_script_reports_invalid_base_url_as_structured_failure(
    tmp_path: Path,
) -> None:
    env_file = tmp_path / "invalid-base-url.env"
    env_file.write_text(
        "\n".join(
            [
                "IAP_MODEL_ACTIVE_PROVIDER=siliconflow",
                "IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT=openai_chat_completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1/chat/completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_CHAT_COMPLETIONS_PATH=/chat/completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_DEFAULT_MODEL=Qwen/Qwen3.5-4B",
                "IAP_MODEL_PROVIDER_SILICONFLOW_API_KEY=siliconflow-secret",
            ]
        ),
        encoding="utf-8",
    )

    result = subprocess.run(
        [sys.executable, str(SMOKE_SCRIPT_PATH), "--env-file", str(env_file)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        env=os.environ.copy(),
        check=False,
    )

    assert result.returncode == 2
    assert "provider=siliconflow" in result.stdout
    assert "model=Qwen/Qwen3.5-4B" in result.stdout
    assert "apiFormat=openai_chat_completions" in result.stdout
    assert "apiKey=configured" in result.stdout
    assert "status=failed" in result.stdout
    assert "failureClass=model_gateway_bug" in result.stdout
    assert "errorType=configuration_invalid_base_url" in result.stdout
    assert "retryable=false" in result.stdout
    assert "suggestedAction=fix_provider_env_or_configuration" in result.stdout
    assert "safeErrorMessage=provider=siliconflow; duplicated_chat_path=true" in result.stdout
    assert "siliconflow-secret" not in result.stdout
