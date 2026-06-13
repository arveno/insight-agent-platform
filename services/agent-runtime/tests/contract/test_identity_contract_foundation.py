from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
SCHEMAS_ROOT = REPO_ROOT / "packages/contracts/schemas"
OPENAPI_PATH = REPO_ROOT / "packages/contracts/openapi/agent-runtime.openapi.yaml"


def load_schema(relative_path: str) -> dict[str, object]:
    return json.loads((SCHEMAS_ROOT / relative_path).read_text(encoding="utf-8"))


def test_identity_contract_schemas_define_workspace_membership_and_auth_foundation() -> None:
    required_schema_fields = {
        "workspace/user.schema.json": {
            "userId",
            "email",
            "displayName",
            "createdAt",
            "updatedAt",
        },
        "workspace/workspace.schema.json": {
            "workspaceId",
            "name",
            "createdAt",
            "updatedAt",
        },
        "workspace/role.schema.json": {
            "role",
        },
        "workspace/workspace-membership.schema.json": {
            "membershipId",
            "userId",
            "workspaceId",
            "role",
            "createdAt",
            "updatedAt",
        },
        "workspace/workspace-list-item.schema.json": {
            "membership",
            "workspace",
        },
        "workspace/auth-session.schema.json": {
            "authSessionId",
            "userId",
            "currentWorkspaceId",
            "expiresAt",
            "createdAt",
            "updatedAt",
        },
        "workspace/current-workspace-context.schema.json": {
            "membershipId",
            "userId",
            "workspaceId",
            "role",
        },
        "workspace/login-request.schema.json": {
            "email",
            "password",
        },
        "workspace/login-response.schema.json": {
            "user",
            "authSession",
            "currentWorkspaceContext",
            "memberships",
        },
        "workspace/me-response.schema.json": {
            "user",
            "authSession",
            "currentWorkspaceContext",
        },
        "workspace/workspace-list-response.schema.json": {
            "items",
        },
        "workspace/select-workspace-request.schema.json": {
            "workspaceId",
        },
        "workspace/select-workspace-response.schema.json": {
            "authSession",
            "currentWorkspaceContext",
        },
        "workspace/logout-response.schema.json": {
            "success",
        },
    }

    for relative_path, expected_required_fields in required_schema_fields.items():
        schema = load_schema(relative_path)
        assert schema["type"] == "object"
        assert schema["additionalProperties"] is False
        assert expected_required_fields.issubset(set(schema["required"]))


def test_openapi_declares_identity_workspace_component_schemas() -> None:
    openapi_source = OPENAPI_PATH.read_text(encoding="utf-8")

    expected_component_names = [
        "User",
        "Workspace",
        "Role",
        "WorkspaceMembership",
        "WorkspaceListItem",
        "AuthSession",
        "CurrentWorkspaceContext",
        "LoginRequest",
        "LoginResponse",
        "MeResponse",
        "WorkspaceListResponse",
        "SelectWorkspaceRequest",
        "SelectWorkspaceResponse",
        "LogoutResponse",
    ]

    for component_name in expected_component_names:
        assert f"    {component_name}:" in openapi_source


def test_openapi_declares_auth_and_workspace_foundation_paths() -> None:
    openapi_source = OPENAPI_PATH.read_text(encoding="utf-8")

    for path in [
        "/auth/login:",
        "/auth/logout:",
        "/auth/me:",
        "/auth/select-workspace:",
        "/workspaces:",
    ]:
        assert f"  {path}" in openapi_source


def test_workspace_list_contract_composes_membership_and_workspace_objects() -> None:
    workspace_list_item_schema = load_schema("workspace/workspace-list-item.schema.json")
    assert workspace_list_item_schema["properties"] == {
        "membership": {"$ref": "./workspace-membership.schema.json"},
        "workspace": {"$ref": "./workspace.schema.json"},
    }

    workspace_list_response_schema = load_schema("workspace/workspace-list-response.schema.json")
    assert workspace_list_response_schema["properties"] == {
        "items": {
            "type": "array",
            "items": {"$ref": "./workspace-list-item.schema.json"},
        }
    }
