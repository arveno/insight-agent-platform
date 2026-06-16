from __future__ import annotations

import os
import socket
import subprocess
import uuid
from collections.abc import Iterator
from pathlib import Path
from typing import cast

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings

REPO_ROOT = Path(__file__).resolve().parents[4]
RUNTIME_FOUNDATION_SCRIPT = REPO_ROOT / "scripts/migration/runtime_foundation.sh"
LOGIN_EMAIL = "zoe@northstar.example.com"
LOGIN_PASSWORD = "zoe-password"

RUNTIME_FOUNDATION_TABLES = (
    "auth_sessions",
    "workspace_memberships",
    "workspaces",
    "users",
    "metric_context_sources",
    "metrics",
    "message_streams",
    "messages",
    "report_sections",
    "decisions",
    "reports",
    "source_evidence",
    "model_calls",
    "tool_calls",
    "run_events",
    "execution_attempts",
    "analysis_runs",
    "conversations",
    "analysis_tasks",
)


def run_runtime_foundation_command(
    *args: str,
    env_overrides: dict[str, str] | None = None,
    input_text: str | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    if env_overrides is not None:
        env.update(env_overrides)

    return subprocess.run(
        [str(RUNTIME_FOUNDATION_SCRIPT), *args],
        cwd=REPO_ROOT,
        input=input_text,
        text=True,
        capture_output=True,
        check=check,
        env=env,
    )


def pick_free_port() -> str:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return str(sock.getsockname()[1])


def build_runtime_foundation_env(data_dir: Path) -> dict[str, str]:
    project_suffix = uuid.uuid4().hex[:8]
    mysql_host_port = pick_free_port()

    return {
        "IAP_MIGRATION_TARGET": "local",
        "IAP_MIGRATION_COMPOSE_PROJECT_NAME": f"iap-runtime-integration-{project_suffix}",
        "IAP_MIGRATION_DATA_DIR": str(data_dir),
        "IAP_MIGRATION_MYSQL_HOST_PORT": mysql_host_port,
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": mysql_host_port,
        "MYSQL_DATABASE": "insight_agent_platform",
        "MYSQL_USER": "iap_preview",
        "MYSQL_PASSWORD": "iap_preview_password",
    }


def truncate_runtime_foundation_tables(env_overrides: dict[str, str]) -> None:
    truncate_sql = "\n".join(
        [
            "SET FOREIGN_KEY_CHECKS = 0;",
            *[f"TRUNCATE TABLE {table_name};" for table_name in RUNTIME_FOUNDATION_TABLES],
            "SET FOREIGN_KEY_CHECKS = 1;",
        ]
    )
    truncate_result = run_runtime_foundation_command(
        "exec-sql",
        env_overrides=env_overrides,
        input_text=truncate_sql,
    )
    assert truncate_result.returncode == 0, truncate_result.stderr


def seed_runtime_foundation() -> None:
    seed_result = run_runtime_foundation_command("seed")
    assert seed_result.returncode == 0, seed_result.stderr


def login_client(
    client: TestClient,
    *,
    workspace_id: str | None = None,
) -> dict[str, object]:
    login_response = client.post(
        "/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    assert login_response.status_code == 200, login_response.text

    login_payload = cast(dict[str, object], login_response.json())
    auth_session = cast(dict[str, object], login_payload["authSession"])
    current_workspace_id = auth_session["currentWorkspaceId"]
    if workspace_id is not None and workspace_id != current_workspace_id:
        select_workspace_response = client.post(
            "/auth/select-workspace",
            json={"workspaceId": workspace_id},
        )
        assert select_workspace_response.status_code == 200, select_workspace_response.text

    return login_payload


@pytest.fixture(scope="session")
def runtime_foundation_session_env(
    tmp_path_factory: pytest.TempPathFactory,
) -> Iterator[dict[str, str]]:
    env_overrides = build_runtime_foundation_env(
        tmp_path_factory.mktemp("runtime-foundation-mysql") / "mysql-data"
    )

    try:
        migrate_result = run_runtime_foundation_command("migrate", env_overrides=env_overrides)
        assert migrate_result.returncode == 0, migrate_result.stderr
        yield env_overrides
    finally:
        run_runtime_foundation_command("down", env_overrides=env_overrides, check=False)
        get_settings.cache_clear()


@pytest.fixture()
def runtime_foundation_env(
    runtime_foundation_session_env: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[None]:
    for key, value in runtime_foundation_session_env.items():
        monkeypatch.setenv(key, value)

    get_settings.cache_clear()
    truncate_runtime_foundation_tables(runtime_foundation_session_env)

    try:
        yield
    finally:
        truncate_runtime_foundation_tables(runtime_foundation_session_env)
        get_settings.cache_clear()
