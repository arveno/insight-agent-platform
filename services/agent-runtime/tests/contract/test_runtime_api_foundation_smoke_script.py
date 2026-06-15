from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
SMOKE_SCRIPT_PATH = REPO_ROOT / "scripts/smoke/runtime_api_foundation.sh"


def test_runtime_api_foundation_smoke_uses_canonical_submit_entry() -> None:
    source = SMOKE_SCRIPT_PATH.read_text(encoding="utf-8")

    assert 'printf \'POST %s\\n\' "$(api_url "/auth/login")"' in source
    assert 'printf \'POST %s\\n\' "$(api_url "/analysis-tasks/submit")"' in source
    assert 'printf \'POST %s\\n\' "$(api_url "/analysis-tasks")"' not in source
    assert 'printf \'POST %s\\n\' "$(api_url "/conversations")"' not in source
    assert 'printf \'POST %s\\n\' "$(api_url "/analysis-runs")"' not in source
    assert 'printf \'POST %s\\n\' "$(api_url "/messages")"' not in source
    assert '$(api_url "/analysis-runs/${RUN_ID}/dispatch")' not in source

    assert '"kind": "dashboardOverview"' in source
    assert '"metricId": "metric-recognized-revenue"' in source
    assert '"tableId": "table-sales-order"' in source
    assert '"tableId": "table-refund-order"' in source
    assert '"knowledgeDocumentId": "knowledge-document-channel-weekly-17"' in source
    assert '"knowledgeDocumentId": "knowledge-document-inventory-east-04"' in source
    assert '"reportId": "report-weekly-business"' not in source
