from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient

from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import RuntimeFoundationPyMySqlDatabase
from tests.integration.conftest import run_runtime_foundation_command

LOGIN_EMAIL = "zoe@northstar.example.com"
LOGIN_PASSWORD = "zoe-password"
SESSION_COOKIE_NAME = "iap_auth_session"


@pytest.fixture()
def client(runtime_foundation_env: None) -> Iterator[TestClient]:
    seed_result = run_runtime_foundation_command("seed")
    assert seed_result.returncode == 0, seed_result.stderr

    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        yield test_client


def test_login_sets_cookie_and_returns_contract_shape(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )

    assert response.status_code == 200, response.text
    payload = response.json()

    assert payload["user"] == {
        "userId": "user-zoe",
        "email": LOGIN_EMAIL,
        "displayName": "Zoe",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }
    assert payload["authSession"]["authSessionId"].startswith("auth-session-")
    assert payload["authSession"]["userId"] == "user-zoe"
    assert payload["authSession"]["currentWorkspaceId"] == "workspace-northstar-retail-china"
    assert payload["currentWorkspaceContext"] == {
        "membershipId": "membership-user-zoe-northstar-retail-china",
        "userId": "user-zoe",
        "workspaceId": "workspace-northstar-retail-china",
        "role": "analyst",
    }
    assert payload["memberships"] == [
        {
            "membershipId": "membership-user-zoe-northstar-retail-china",
            "userId": "user-zoe",
            "workspaceId": "workspace-northstar-retail-china",
            "role": "analyst",
            "createdAt": "2026-06-05T11:08:12+08:00",
            "updatedAt": "2026-06-05T11:08:12+08:00",
        },
        {
            "membershipId": "membership-user-zoe-northstar-retail-sea",
            "userId": "user-zoe",
            "workspaceId": "workspace-northstar-retail-sea",
            "role": "viewer",
            "createdAt": "2026-06-05T11:08:12+08:00",
            "updatedAt": "2026-06-05T11:08:12+08:00",
        },
    ]
    assert "passwordHash" not in response.text
    assert "sessionTokenHash" not in response.text

    assert SESSION_COOKIE_NAME in response.cookies

    expires_at = datetime.fromisoformat(
        payload["authSession"]["expiresAt"].replace("Z", "+00:00")
    )
    assert expires_at > datetime.now(UTC)


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": LOGIN_EMAIL, "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json() == {
        "errorCode": "UNAUTHORIZED",
        "message": "Invalid email or password.",
    }


def test_me_workspaces_select_workspace_and_logout_use_cookie_session(client: TestClient) -> None:
    login_response = client.post(
        "/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    assert login_response.status_code == 200, login_response.text

    me_response = client.get("/auth/me")
    assert me_response.status_code == 200, me_response.text
    assert me_response.json()["currentWorkspaceContext"] == {
        "membershipId": "membership-user-zoe-northstar-retail-china",
        "userId": "user-zoe",
        "workspaceId": "workspace-northstar-retail-china",
        "role": "analyst",
    }

    workspace_list_response = client.get("/workspaces")
    assert workspace_list_response.status_code == 200, workspace_list_response.text
    assert workspace_list_response.json() == {
        "items": [
            {
                "membership": {
                    "membershipId": "membership-user-zoe-northstar-retail-china",
                    "userId": "user-zoe",
                    "workspaceId": "workspace-northstar-retail-china",
                    "role": "analyst",
                    "createdAt": "2026-06-05T11:08:12+08:00",
                    "updatedAt": "2026-06-05T11:08:12+08:00",
                },
                "workspace": {
                    "workspaceId": "workspace-northstar-retail-china",
                    "name": "Northstar Retail China",
                    "createdAt": "2026-06-05T11:08:12+08:00",
                    "updatedAt": "2026-06-05T11:08:12+08:00",
                },
            },
            {
                "membership": {
                    "membershipId": "membership-user-zoe-northstar-retail-sea",
                    "userId": "user-zoe",
                    "workspaceId": "workspace-northstar-retail-sea",
                    "role": "viewer",
                    "createdAt": "2026-06-05T11:08:12+08:00",
                    "updatedAt": "2026-06-05T11:08:12+08:00",
                },
                "workspace": {
                    "workspaceId": "workspace-northstar-retail-sea",
                    "name": "Northstar Retail SEA",
                    "createdAt": "2026-06-05T11:08:12+08:00",
                    "updatedAt": "2026-06-05T11:08:12+08:00",
                },
            },
        ]
    }

    select_workspace_response = client.post(
        "/auth/select-workspace",
        json={"workspaceId": "workspace-northstar-retail-sea"},
    )
    assert select_workspace_response.status_code == 200, select_workspace_response.text
    select_workspace_payload = select_workspace_response.json()
    assert select_workspace_payload["authSession"]["authSessionId"] == login_response.json()[
        "authSession"
    ]["authSessionId"]
    assert select_workspace_payload["authSession"]["userId"] == "user-zoe"
    assert (
        select_workspace_payload["authSession"]["currentWorkspaceId"]
        == "workspace-northstar-retail-sea"
    )
    assert select_workspace_payload["currentWorkspaceContext"] == {
        "membershipId": "membership-user-zoe-northstar-retail-sea",
        "userId": "user-zoe",
        "workspaceId": "workspace-northstar-retail-sea",
        "role": "viewer",
    }

    database = RuntimeFoundationPyMySqlDatabase(
        host=get_settings().mysql_host,
        port=get_settings().mysql_port,
        database=get_settings().mysql_database,
        user=get_settings().mysql_user,
        password=get_settings().mysql_password,
    )
    database.execute_sql(
        """
INSERT INTO workspaces (
  workspace_id,
  name,
  created_at,
  updated_at
) VALUES (
  'workspace-forbidden-test',
  'Forbidden Workspace',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
);
"""
    )
    forbidden_response = client.post(
        "/auth/select-workspace",
        json={"workspaceId": "workspace-forbidden-test"},
    )
    assert forbidden_response.status_code == 403
    assert forbidden_response.json() == {
        "errorCode": "FORBIDDEN",
        "message": "Workspace membership not found: workspace-forbidden-test",
    }

    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == 200, logout_response.text
    assert logout_response.json() == {"success": True}

    me_after_logout = client.get("/auth/me")
    assert me_after_logout.status_code == 401
    assert me_after_logout.json() == {
        "errorCode": "UNAUTHORIZED",
        "message": "Authentication session is missing or invalid.",
    }


def test_invalid_session_cookie_returns_401(client: TestClient) -> None:
    client.cookies.set(SESSION_COOKIE_NAME, "invalid-session-token")

    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json() == {
        "errorCode": "UNAUTHORIZED",
        "message": "Authentication session is missing or invalid.",
    }
