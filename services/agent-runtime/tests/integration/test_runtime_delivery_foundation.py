from __future__ import annotations

from collections.abc import Iterator
from copy import deepcopy
from typing import Any, Literal, cast

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings
from src.app.main import create_app
from tests.integration.conftest import login_client, seed_runtime_foundation

def build_context_pack(analysis_task_id: str | None = None) -> dict[str, Any]:
    owner: dict[str, str] = {"type": "analysisTask"}

    if analysis_task_id is not None:
        owner["analysisTaskId"] = analysis_task_id

    return {
        "version": 1,
        "suggestedPrompt": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "traceability": "direct_refs",
        "capturedAt": "2026-06-05T03:08:12Z",
        "root": {
            "nodeId": "inspector-node-task-context-root",
            "kind": "dashboardOverview",
            "role": "inputContext",
            "owner": owner,
            "title": "经营状态总览",
            "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
            "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
            "timeRange": {"key": "this_quarter", "label": "2026 Q2"},
            "capturedAt": "2026-06-05T03:08:12Z",
            "children": [
                {
                    "nodeId": "inspector-node-task-context-metric",
                    "kind": "metric",
                    "role": "inputContext",
                    "owner": owner,
                    "title": "确认收入",
                    "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
                    "value": "收入增速 < -2%",
                    "sourceRef": {
                        "type": "metric",
                        "metricId": "metric-recognized-revenue",
                    },
                }
            ],
        },
    }

TASK_PAYLOAD = {
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": build_context_pack(),
    "title": "收入增速异常",
}

PRODUCER_ID = "delivery-producer-foundation"
WORKER_ID = "worker-runtime-dispatch-foundation"


def response_json_dict(payload: object) -> dict[str, Any]:
    return cast(dict[str, Any], payload)


@pytest.fixture()
def client(runtime_foundation_env: None) -> Iterator[TestClient]:
    get_settings.cache_clear()
    seed_runtime_foundation()
    with TestClient(create_app()) as test_client:
        login_client(test_client)
        yield test_client


def create_analysis_task(client: TestClient) -> dict[str, Any]:
    payload = deepcopy(TASK_PAYLOAD)
    conversation = create_conversation(client)
    payload["conversationId"] = conversation["conversationId"]
    response = client.post("/analysis-tasks", json=payload)
    assert response.status_code == 201, response.text
    return response_json_dict(response.json())


def get_conversation(client: TestClient, conversation_id: str) -> dict[str, Any]:
    response = client.get(f"/conversations/{conversation_id}")
    assert response.status_code == 200, response.text
    return response_json_dict(response.json())


def create_conversation(
    client: TestClient,
) -> dict[str, Any]:
    response = client.post(
        "/conversations",
        json={"title": TASK_PAYLOAD["title"]},
    )
    assert response.status_code == 201, response.text
    return response_json_dict(response.json())


def create_analysis_run(
    client: TestClient,
    analysis_task_id: str,
) -> dict[str, Any]:
    response = client.post(
        "/analysis-runs",
        json={"analysisTaskId": analysis_task_id},
    )
    assert response.status_code == 201, response.text
    return response_json_dict(response.json())


def get_execution_attempts(client: TestClient, run_id: str) -> list[dict[str, Any]]:
    response = client.get(f"/analysis-runs/{run_id}/execution-attempts")
    assert response.status_code == 200
    return cast(list[dict[str, Any]], response.json()["items"])


def get_run_events(client: TestClient, run_id: str) -> list[dict[str, Any]]:
    response = client.get(f"/analysis-runs/{run_id}/events")
    assert response.status_code == 200
    return cast(list[dict[str, Any]], response.json()["items"])


def create_running_execution_run(client: TestClient) -> dict[str, Any]:
    analysis_task = create_analysis_task(client)
    conversation = get_conversation(client, analysis_task["conversationId"])
    analysis_run = create_analysis_run(client, analysis_task["analysisTaskId"])

    dispatch_response = client.post(f"/analysis-runs/{analysis_run['runId']}/dispatch")
    assert dispatch_response.status_code == 202

    attempt = get_execution_attempts(client, analysis_run["runId"])[0]

    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": WORKER_ID},
    )
    assert claim_response.status_code == 202

    heartbeat_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-heartbeat",
        json={"attemptId": attempt["attemptId"], "workerId": WORKER_ID},
    )
    assert heartbeat_response.status_code == 200

    running_run_response = client.get(f"/analysis-runs/{analysis_run['runId']}")
    assert running_run_response.status_code == 200
    running_run = response_json_dict(running_run_response.json())
    assert running_run["status"] == "running"
    assert running_run["phase"] == "execution"

    return {
        "analysisTask": analysis_task,
        "conversation": conversation,
        "analysisRun": running_run,
        "attempt": attempt,
    }


def create_delivery_ready_run(client: TestClient) -> dict[str, Any]:
    running_execution = create_running_execution_run(client)
    analysis_run = running_execution["analysisRun"]
    attempt = running_execution["attempt"]

    release_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-release",
        json={"attemptId": attempt["attemptId"], "workerId": WORKER_ID},
    )
    assert release_response.status_code == 202
    released_run = response_json_dict(release_response.json())
    assert released_run["status"] == "running"
    assert released_run["phase"] == "delivery"

    return {
        "analysisTask": running_execution["analysisTask"],
        "conversation": running_execution["conversation"],
        "analysisRun": released_run,
        "attempt": attempt,
    }


def assert_no_delivery_outputs(
    client: TestClient,
    *,
    run_id: str,
    conversation_id: str,
) -> None:
    assert client.get(f"/analysis-runs/{run_id}/tool-calls").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/model-calls").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/source-evidence").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/reports").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/decisions").json() == {"items": []}
    assert client.get(f"/conversations/{conversation_id}/messages").json() == {"items": []}


def assert_event_subsequence(event_types: list[str], expected: list[str]) -> None:
    position = 0
    for event_type in event_types:
        if position < len(expected) and event_type == expected[position]:
            position += 1
    assert position == len(expected)


def test_delivery_complete_persists_artifacts_messages_streams_and_completes_run(
    client: TestClient,
) -> None:
    delivery_ready = create_delivery_ready_run(client)
    run_id = delivery_ready["analysisRun"]["runId"]
    conversation_id = delivery_ready["conversation"]["conversationId"]

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": PRODUCER_ID},
    )

    assert response.status_code == 202
    completed_run = response_json_dict(response.json())
    assert completed_run["runId"] == run_id
    assert completed_run["status"] == "completed"
    assert completed_run["phase"] == "delivery"
    assert completed_run["outcome"] == "success"
    assert completed_run["completedAt"] is not None

    tool_calls_response = client.get(f"/analysis-runs/{run_id}/tool-calls")
    assert tool_calls_response.status_code == 200
    tool_calls = response_json_dict(tool_calls_response.json())["items"]
    assert len(tool_calls) == 1
    tool_call = tool_calls[0]
    assert tool_call["runId"] == run_id
    assert tool_call["toolName"] == "metrics.summary.compare"
    assert tool_call["status"] == "succeeded"
    assert tool_call["riskLevel"] == "medium"
    assert tool_call["permission"] == "metrics.read"

    model_calls_response = client.get(f"/analysis-runs/{run_id}/model-calls")
    assert model_calls_response.status_code == 200
    model_calls = response_json_dict(model_calls_response.json())["items"]
    assert len(model_calls) == 1
    model_call = model_calls[0]
    assert model_call["runId"] == run_id
    assert model_call["provider"] == "openai"
    assert model_call["status"] == "succeeded"

    source_evidence_response = client.get(f"/analysis-runs/{run_id}/source-evidence")
    assert source_evidence_response.status_code == 200
    source_evidence_items = response_json_dict(source_evidence_response.json())["items"]
    assert len(source_evidence_items) == 2
    source_evidence_ids = {item["sourceEvidenceId"] for item in source_evidence_items}
    assert {item["sourceType"] for item in source_evidence_items} == {"knowledge_document"}

    reports_response = client.get(f"/analysis-runs/{run_id}/reports")
    assert reports_response.status_code == 200
    reports = response_json_dict(reports_response.json())["items"]
    assert len(reports) == 1
    report = reports[0]
    assert report["runId"] == run_id
    assert report["reportId"].startswith("report-")
    assert set(report["sourceEvidence"]) == source_evidence_ids
    assert len(report["sections"]) >= 1

    decisions_response = client.get(f"/analysis-runs/{run_id}/decisions")
    assert decisions_response.status_code == 200
    decisions = response_json_dict(decisions_response.json())["items"]
    assert len(decisions) == 1
    decision = decisions[0]
    assert decision["runId"] == run_id
    assert decision["decisionId"].startswith("decision-")
    assert decision["reportId"] == report["reportId"]

    messages_response = client.get(f"/conversations/{conversation_id}/messages")
    assert messages_response.status_code == 200
    messages = response_json_dict(messages_response.json())["items"]
    assistant_messages = [message for message in messages if message["role"] == "assistant"]
    assert len(assistant_messages) == 1
    assistant_message = assistant_messages[0]
    assert assistant_message["runId"] == run_id
    assert assistant_message["reportId"] == report["reportId"]
    assert set(assistant_message["sourceEvidenceIds"]) == source_evidence_ids
    assert assistant_message["toolCallIds"] == [tool_call["toolCallId"]]

    replay_response = client.get(
        f"/conversations/{conversation_id}/messages/{assistant_message['messageId']}/stream",
        headers={"accept": "application/json"},
    )
    assert replay_response.status_code == 200
    replay_items = response_json_dict(replay_response.json())["items"]
    assert [item["sequence"] for item in replay_items] == [0, 1, 2]
    assert [item["eventType"] for item in replay_items] == [
        "stream.started",
        "stream.delta",
        "stream.completed",
    ]

    sse_response = client.get(
        f"/conversations/{conversation_id}/messages/{assistant_message['messageId']}/stream",
        headers={"accept": "text/event-stream"},
    )
    assert sse_response.status_code == 200
    assert sse_response.headers["content-type"].startswith("text/event-stream")
    assert "event: stream.started" in sse_response.text
    assert "event: stream.delta" in sse_response.text
    assert "event: stream.completed" in sse_response.text

    execution_attempts = get_execution_attempts(client, run_id)
    assert len(execution_attempts) == 1
    assert execution_attempts[0]["status"] == "released"

    events = get_run_events(client, run_id)
    event_types = [event["eventType"] for event in events]
    assert_event_subsequence(
        event_types,
        [
            "run.created",
            "validation.started",
            "validation.passed",
            "policy.decision_recorded",
            "context.bound",
            "plan.created",
            "run.queued",
            "worker.lease_acquired",
            "worker.heartbeat",
            "worker.lease_released",
            "tool_call.requested",
            "tool_call.policy_checked",
            "tool_call.started",
            "tool_call.completed",
            "model_call.started",
            "model_call.completed",
            "evidence.retrieved",
            "evidence.bound",
            "synthesis.started",
            "delivery.started",
            "artifact.persisted",
            "run.completed",
        ],
    )
    assert event_types.count("run.completed") == 1
    assert event_types.index("artifact.persisted") < event_types.index("run.completed")
    assert event_types.index("worker.lease_released") < event_types.index("artifact.persisted")


def test_delivery_complete_rejects_non_delivery_run_without_persisting_outputs(
    client: TestClient,
) -> None:
    running_execution = create_running_execution_run(client)
    analysis_run = running_execution["analysisRun"]
    conversation = running_execution["conversation"]
    attempt = running_execution["attempt"]

    response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/delivery/complete",
        json={"producerId": PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert_no_delivery_outputs(
        client,
        run_id=analysis_run["runId"],
        conversation_id=conversation["conversationId"],
    )
    events = get_run_events(client, analysis_run["runId"])
    assert "run.completed" not in [event["eventType"] for event in events]
    execution_attempts = get_execution_attempts(client, analysis_run["runId"])
    assert len(execution_attempts) == 1
    assert execution_attempts[0]["attemptId"] == attempt["attemptId"]
    assert execution_attempts[0]["status"] == "running"


@pytest.mark.parametrize(
    "terminal_status",
    ["failed", "cancelled", "expired"],
)
def test_delivery_complete_rejects_terminal_runs_without_fake_completion(
    client: TestClient,
    terminal_status: Literal["failed", "cancelled", "expired"],
) -> None:
    running_execution = create_running_execution_run(client)
    run_id = running_execution["analysisRun"]["runId"]
    conversation_id = running_execution["conversation"]["conversationId"]
    attempt_id = running_execution["attempt"]["attemptId"]

    if terminal_status == "failed":
        transition_response = client.post(
            f"/analysis-runs/{run_id}/worker-failure",
            json={
                "attemptId": attempt_id,
                "workerId": WORKER_ID,
                "failureCode": "WORKER_EXECUTION_ERROR",
                "failureMessage": "worker execution failed",
            },
        )
    elif terminal_status == "expired":
        transition_response = client.post(
            f"/analysis-runs/{run_id}/worker-lost",
            json={
                "attemptId": attempt_id,
                "workerId": WORKER_ID,
                "lostReason": "worker heartbeat timed out",
            },
        )
    else:
        transition_response = client.post(
            f"/analysis-runs/{run_id}/cancel",
            json={"reason": "user cancelled during execution"},
        )

    assert transition_response.status_code == 202

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert_no_delivery_outputs(client, run_id=run_id, conversation_id=conversation_id)
    events = get_run_events(client, run_id)
    assert "run.completed" not in [event["eventType"] for event in events]
