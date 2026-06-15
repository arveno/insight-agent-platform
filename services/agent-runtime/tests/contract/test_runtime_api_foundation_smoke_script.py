from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
SMOKE_SCRIPT_PATH = REPO_ROOT / "scripts/smoke/runtime_api_foundation.sh"


def test_runtime_api_foundation_smoke_uses_canonical_submit_entry() -> None:
    source = SMOKE_SCRIPT_PATH.read_text(encoding="utf-8")

    assert '/auth/login' in source
    assert '/analysis-tasks/submit' in source
    assert 'POST %s/analysis-tasks\\n' not in source
    assert 'POST %s/conversations\\n' not in source
    assert 'POST %s/analysis-runs\\n' not in source
