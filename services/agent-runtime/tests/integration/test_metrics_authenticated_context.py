from __future__ import annotations

from fastapi.testclient import TestClient

from src.app.main import create_app
from tests.integration.conftest import login_client, seed_runtime_foundation


def extract_metric_ids(payload: dict[str, object]) -> list[str]:
    items = payload["items"]
    assert isinstance(items, list)
    return [item["metricId"] for item in items]  # type: ignore[index]


def extract_context_source_ids(payload: dict[str, object]) -> list[str]:
    context_sources = payload["contextSources"]
    assert isinstance(context_sources, list)
    return [item["metricContextSourceId"] for item in context_sources]  # type: ignore[index]


def assert_metric_shape(metric: dict[str, object], *, workspace_id: str) -> None:
    assert metric["workspaceId"] == workspace_id
    assert isinstance(metric["metricId"], str)
    assert isinstance(metric["businessDomainId"], str)
    assert isinstance(metric["name"], str)
    assert isinstance(metric["description"], str)
    assert isinstance(metric["currentValue"], str)
    assert metric["trendDirection"] in {"up", "down", "flat"}
    assert metric["riskLevel"] in {"low", "medium", "high", "critical"}
    assert isinstance(metric["formulaSummary"], str)
    assert isinstance(metric["thresholdSummary"], str)
    assert isinstance(metric["contextSources"], list)

def _unauthenticate(client: TestClient) -> None:
    client.cookies.pop("iap_auth_session", None)


def test_metrics_routes_require_authenticated_session(runtime_foundation_env: None) -> None:
    seed_runtime_foundation()
    with TestClient(create_app()) as client:
        _unauthenticate(client)

        list_response = client.get("/metrics")
        assert list_response.status_code == 401
        assert list_response.json() == {
            "errorCode": "UNAUTHORIZED",
            "message": "Authentication session is missing or invalid.",
        }

        detail_response = client.get("/metrics/metric-recognized-revenue")
        assert detail_response.status_code == 401
        assert detail_response.json() == {
            "errorCode": "UNAUTHORIZED",
            "message": "Authentication session is missing or invalid.",
        }


def test_list_metrics_filters_by_current_authenticated_workspace(runtime_foundation_env: None) -> None:
    seed_runtime_foundation()

    with TestClient(create_app()) as client:
        login_client(client, workspace_id="workspace-northstar-retail-china")

        china_response = client.get("/metrics")
        assert china_response.status_code == 200, china_response.text
        china_payload = china_response.json()
        china_metric_ids = extract_metric_ids(china_payload)
        assert china_metric_ids == [
            "metric-recognized-revenue",
            "metric-gross-margin",
            "metric-refund-rate",
            "metric-inventory-turnover",
        ]
        for metric in china_payload["items"]:
            assert_metric_shape(metric, workspace_id="workspace-northstar-retail-china")

        select_workspace_response = client.post(
            "/auth/select-workspace",
            json={"workspaceId": "workspace-northstar-retail-sea"},
        )
        assert select_workspace_response.status_code == 200, select_workspace_response.text

        sea_response = client.get("/metrics")
        assert sea_response.status_code == 200, sea_response.text
        sea_payload = sea_response.json()
        sea_metric_ids = extract_metric_ids(sea_payload)
        assert sea_metric_ids == [
            "metric-sea-recognized-revenue",
            "metric-sea-delivery-delay-rate",
        ]
        for metric in sea_payload["items"]:
            assert_metric_shape(metric, workspace_id="workspace-northstar-retail-sea")


def test_get_metric_reads_current_workspace_only_and_returns_context_sources(
    runtime_foundation_env: None,
) -> None:
    seed_runtime_foundation()

    with TestClient(create_app()) as client:
        login_client(client, workspace_id="workspace-northstar-retail-china")

        response = client.get("/metrics/metric-recognized-revenue")
        assert response.status_code == 200, response.text
        payload = response.json()
        assert_metric_shape(payload, workspace_id="workspace-northstar-retail-china")
        assert payload["metricId"] == "metric-recognized-revenue"
        assert payload["name"] == "确认收入"
        assert payload["contextSources"][0]["sourceType"] == "dataTable"
        assert extract_context_source_ids(payload) == [
            "metric-context-source-revenue-table",
            "metric-context-source-revenue-report",
        ]

        forbidden_workspace_metric = client.get("/metrics/metric-sea-recognized-revenue")
        assert forbidden_workspace_metric.status_code == 404
        assert forbidden_workspace_metric.json() == {
            "errorCode": "NOT_FOUND",
            "message": "Metric not found: metric-sea-recognized-revenue",
        }
