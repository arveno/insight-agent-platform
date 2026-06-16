from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
SMOKE_SCRIPT_PATH = REPO_ROOT / "scripts/smoke/model-provider-readiness.py"


def test_model_provider_readiness_smoke_script_exposes_masked_cli_surface() -> None:
    source = SMOKE_SCRIPT_PATH.read_text(encoding="utf-8")

    assert 'parser.add_argument("--env-file"' in source
    assert 'parser.add_argument("--provider"' in source
    assert "apiKey=configured" in source
    assert "/opt/insight-agent-platform/env/model-provider.env" not in source
