"""Auth/session helpers for request-context resolution and opaque cookie sessions."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Literal
from uuid import uuid4

from fastapi import Request, Response

from src.app.config import get_settings
from src.infrastructure.database.runtime_foundation import (
    AuthSessionRepository,
    AuthSessionStateRecord,
    CurrentWorkspaceContextRecord,
    CurrentWorkspaceContextRepository,
    RuntimeFoundationPyMySqlDatabase,
)


@dataclass(frozen=True)
class AuthenticatedSession:
    """Authenticated session state resolved from the opaque cookie token."""

    authSessionId: str
    userId: str
    currentWorkspaceId: str | None
    expiresAt: str
    createdAt: str
    updatedAt: str
    lastAccessedAt: str | None


@dataclass(frozen=True)
class AuthenticatedRequestContext:
    """Canonical current workspace context derived from the authenticated session."""

    authSessionId: str
    membershipId: str
    userId: str
    workspaceId: str
    role: str


@dataclass(frozen=True)
class AuthContextResolutionError(RuntimeError):
    """Raised when the cookie session cannot be resolved into a valid auth context."""

    status_code: int
    error_code: Literal["UNAUTHORIZED", "FORBIDDEN"]
    message: str


def _runtime_foundation_database() -> RuntimeFoundationPyMySqlDatabase:
    settings = get_settings()
    return RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def utc_timestamp() -> str:
    """Return the canonical runtime UTC timestamp string."""

    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def parse_timestamp(value: str) -> datetime:
    """Parse canonical timestamp strings used by runtime persistence."""

    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def hash_session_token(raw_token: str) -> str:
    """Hash the opaque session token before storing or looking it up."""

    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_session_token() -> str:
    """Create a new opaque cookie token for the auth session."""

    return secrets.token_urlsafe(32)


def verify_password_hash(password: str, password_hash: str) -> bool:
    """Verify the stored PBKDF2 password hash using only stdlib primitives."""

    try:
        algorithm, iterations_text, salt, expected_digest = password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    derived_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations_text),
    ).hex()
    return hmac.compare_digest(derived_digest, expected_digest)


def build_auth_session_state(
    *,
    user_id: str,
    current_workspace_id: str | None,
) -> tuple[AuthSessionStateRecord, str]:
    """Build the persisted auth session state and the raw cookie token."""

    settings = get_settings()
    now = utc_timestamp()
    expires_at = (datetime.now(UTC) + timedelta(seconds=settings.auth_session_ttl_seconds)).isoformat(
        timespec="seconds"
    ).replace("+00:00", "Z")
    raw_token = create_session_token()
    auth_session_id = f"auth-session-{uuid4().hex}"

    return (
        {
            "authSessionId": auth_session_id,
            "userId": user_id,
            "currentWorkspaceId": current_workspace_id,
            "sessionTokenHash": hash_session_token(raw_token),
            "expiresAt": expires_at,
            "createdAt": now,
            "updatedAt": now,
            "lastAccessedAt": now,
            "revokedAt": None,
        },
        raw_token,
    )


def set_auth_session_cookie(response: Response, raw_token: str) -> None:
    """Attach the opaque session token cookie to the response."""

    settings = get_settings()
    response.set_cookie(
        key=settings.auth_session_cookie_name,
        value=raw_token,
        max_age=settings.auth_session_ttl_seconds,
        httponly=True,
        samesite=settings.auth_session_cookie_samesite,
        secure=settings.auth_session_cookie_secure,
        path="/",
    )


def clear_auth_session_cookie(response: Response) -> None:
    """Remove the opaque session token cookie from the response."""

    settings = get_settings()
    response.delete_cookie(
        key=settings.auth_session_cookie_name,
        httponly=True,
        samesite=settings.auth_session_cookie_samesite,
        secure=settings.auth_session_cookie_secure,
        path="/",
    )


def auth_session_contract_from_state(auth_session_state: AuthSessionStateRecord) -> AuthenticatedSession:
    """Drop DB-only fields from the stored session state and expose canonical auth fields."""

    return AuthenticatedSession(
        authSessionId=auth_session_state["authSessionId"],
        userId=auth_session_state["userId"],
        currentWorkspaceId=auth_session_state["currentWorkspaceId"],
        expiresAt=auth_session_state["expiresAt"],
        createdAt=auth_session_state["createdAt"],
        updatedAt=auth_session_state["updatedAt"],
        lastAccessedAt=auth_session_state["lastAccessedAt"],
    )


def current_workspace_context_or_none(
    *,
    user_id: str,
    current_workspace_id: str | None,
) -> CurrentWorkspaceContextRecord | None:
    """Resolve the current workspace context only when a workspace is actually selected."""

    if current_workspace_id is None:
        return None

    try:
        return CurrentWorkspaceContextRepository(_runtime_foundation_database()).get_by_user_id_and_workspace_id(
            user_id,
            current_workspace_id,
        )
    except KeyError:
        return None


def resolve_authenticated_session(request: Request) -> AuthenticatedSession:
    """Resolve the opaque cookie token into an active authenticated session."""

    raw_token = request.cookies.get(get_settings().auth_session_cookie_name)
    if raw_token is None:
        raise AuthContextResolutionError(
            status_code=401,
            error_code="UNAUTHORIZED",
            message="Authentication session is missing or invalid.",
        )

    try:
        auth_session_state = AuthSessionRepository(_runtime_foundation_database()).get_state_by_session_token_hash(
            hash_session_token(raw_token)
        )
    except KeyError as error:
        raise AuthContextResolutionError(
            status_code=401,
            error_code="UNAUTHORIZED",
            message="Authentication session is missing or invalid.",
        ) from error

    if auth_session_state["revokedAt"] is not None:
        raise AuthContextResolutionError(
            status_code=401,
            error_code="UNAUTHORIZED",
            message="Authentication session is missing or invalid.",
        )

    if parse_timestamp(auth_session_state["expiresAt"]) <= datetime.now(UTC):
        raise AuthContextResolutionError(
            status_code=401,
            error_code="UNAUTHORIZED",
            message="Authentication session is missing or invalid.",
        )

    return auth_session_contract_from_state(auth_session_state)


def resolve_authenticated_request_context(request: Request) -> AuthenticatedRequestContext:
    """Resolve the authenticated session into membership-scoped current workspace context."""

    auth_session = resolve_authenticated_session(request)
    if auth_session.currentWorkspaceId is None:
        raise AuthContextResolutionError(
            status_code=403,
            error_code="FORBIDDEN",
            message="Current workspace is not selected.",
        )

    current_workspace_context = current_workspace_context_or_none(
        user_id=auth_session.userId,
        current_workspace_id=auth_session.currentWorkspaceId,
    )
    if current_workspace_context is None:
        raise AuthContextResolutionError(
            status_code=403,
            error_code="FORBIDDEN",
            message=f"Workspace membership not found: {auth_session.currentWorkspaceId}",
        )

    return AuthenticatedRequestContext(
        authSessionId=auth_session.authSessionId,
        membershipId=current_workspace_context["membershipId"],
        userId=current_workspace_context["userId"],
        workspaceId=current_workspace_context["workspaceId"],
        role=current_workspace_context["role"],
    )


def authenticated_request_context_dependency(request: Request) -> AuthenticatedRequestContext:
    """FastAPI dependency wrapper for the authenticated request context resolver."""

    return resolve_authenticated_request_context(request)
