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
    assert "apiKey=missing" in result.stdout
    assert "apiKey=configured" not in result.stdout


def test_model_provider_readiness_smoke_script_reports_unknown_api_key_on_missing_config(
    tmp_path: Path,
) -> None:
    env_file = tmp_path / "missing-config.env"
    env_file.write_text(
        "\n".join(
            [
                "IAP_MODEL_ACTIVE_PROVIDER=siliconflow",
                "IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT=openai_chat_completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_CHAT_COMPLETIONS_PATH=/chat/completions",
                "IAP_MODEL_PROVIDER_SILICONFLOW_DEFAULT_MODEL=Qwen/Qwen3.5-4B",
                "IAP_MODEL_PROVIDER_SILICONFLOW_API_KEY=fake-test-secret",
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
    assert "apiKey=unknown" in result.stdout
    assert "apiKey=configured" not in result.stdout
