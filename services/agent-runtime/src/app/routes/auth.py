"""Auth/session HTTP boundary for #212 backend identity foundation."""

from typing import Any

from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse

from src.app.auth import (
    AuthContextResolutionError,
    build_auth_session_state,
    clear_auth_session_cookie,
    current_workspace_context_or_none,
    resolve_authenticated_session,
    set_auth_session_cookie,
    utc_timestamp,
    verify_password_hash,
)
from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    AuthSessionResponse,
    CurrentWorkspaceContextResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RuntimeRequestErrorResponse,
    SelectWorkspaceRequest,
    SelectWorkspaceResponse,
    UserResponse,
    WorkspaceListItemResponse,
    WorkspaceListResponse,
    runtime_error_response,
)
from src.infrastructure.database.runtime_foundation import (
    AuthSessionRepository,
    CurrentWorkspaceContextRepository,
    RuntimeFoundationPyMySqlDatabase,
    UserRepository,
    WorkspaceMembershipRepository,
    WorkspaceRepository,
)

router = APIRouter(tags=["auth"])

AUTH_ERROR_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {
        "description": "Authentication session is missing, invalid, expired, or revoked.",
        "model": RuntimeRequestErrorResponse,
    },
    403: {
        "description": "Authenticated user does not have access to the requested workspace.",
        "model": RuntimeRequestErrorResponse,
    },
    404: {
        "description": "Requested identity or workspace foundation object was not found.",
        "model": RuntimeRequestErrorResponse,
    },
}


def _runtime_foundation_database() -> RuntimeFoundationPyMySqlDatabase:
    settings = get_settings()
    return RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def _auth_session_response(auth_session_id: str) -> AuthSessionResponse:
    return AuthSessionResponse.model_validate(
        AuthSessionRepository(_runtime_foundation_database()).get_by_auth_session_id(auth_session_id)
    )


def _user_response(user_id: str) -> UserResponse:
    return UserResponse.model_validate(
        UserRepository(_runtime_foundation_database()).get_by_user_id(user_id)
    )


def _workspace_list_response(user_id: str) -> WorkspaceListResponse:
    membership_repository = WorkspaceMembershipRepository(_runtime_foundation_database())
    workspace_repository = WorkspaceRepository(_runtime_foundation_database())
    memberships = membership_repository.list_by_user_id(user_id)

    return WorkspaceListResponse(
        items=[
            WorkspaceListItemResponse(
                membership=membership,
                workspace=workspace_repository.get_by_workspace_id(membership["workspaceId"]),
            )
            for membership in memberships
        ]
    )


def _current_workspace_context_response(
    *,
    user_id: str,
    current_workspace_id: str | None,
) -> CurrentWorkspaceContextResponse | None:
    current_workspace_context = current_workspace_context_or_none(
        user_id=user_id,
        current_workspace_id=current_workspace_id,
    )
    if current_workspace_context is None:
        return None
    return CurrentWorkspaceContextResponse.model_validate(current_workspace_context)


def _auth_context_error_response(error: AuthContextResolutionError) -> JSONResponse:
    return runtime_error_response(
        status_code=error.status_code,
        error_code=error.error_code,
        message=error.message,
    )


@router.post(
    "/auth/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    responses=AUTH_ERROR_RESPONSES,
)
def login(request: LoginRequest, response: Response) -> LoginResponse | JSONResponse:
    """Create a new opaque cookie session for the matching user credentials."""

    try:
        user_authentication = UserRepository(
            _runtime_foundation_database()
        ).get_authentication_by_email(request.email)
    except KeyError:
        return runtime_error_response(
            status_code=401,
            error_code="UNAUTHORIZED",
            message="Invalid email or password.",
        )

    if not verify_password_hash(request.password, user_authentication["passwordHash"]):
        return runtime_error_response(
            status_code=401,
            error_code="UNAUTHORIZED",
            message="Invalid email or password.",
        )

    membership_repository = WorkspaceMembershipRepository(_runtime_foundation_database())
    memberships = membership_repository.list_by_user_id(user_authentication["userId"])
    current_workspace_id = memberships[0]["workspaceId"] if memberships else None

    auth_session_state, raw_session_token = build_auth_session_state(
        user_id=user_authentication["userId"],
        current_workspace_id=current_workspace_id,
    )
    AuthSessionRepository(_runtime_foundation_database()).create(auth_session_state)
    set_auth_session_cookie(response, raw_session_token)

    return LoginResponse(
        user=UserResponse.model_validate(
            {
                "userId": user_authentication["userId"],
                "email": user_authentication["email"],
                "displayName": user_authentication["displayName"],
                "createdAt": user_authentication["createdAt"],
                "updatedAt": user_authentication["updatedAt"],
            }
        ),
        authSession=AuthSessionResponse.model_validate(
            AuthSessionRepository(_runtime_foundation_database()).get_by_auth_session_id(
                auth_session_state["authSessionId"]
            )
        ),
        currentWorkspaceContext=_current_workspace_context_response(
            user_id=user_authentication["userId"],
            current_workspace_id=current_workspace_id,
        ),
        memberships=memberships,
    )


@router.get(
    "/auth/me",
    response_model=MeResponse,
    responses=AUTH_ERROR_RESPONSES,
)
def get_auth_me(request: Request) -> MeResponse | JSONResponse:
    """Return the authenticated user, current session, and current workspace context."""

    try:
        auth_session = resolve_authenticated_session(request)
    except AuthContextResolutionError as error:
        return _auth_context_error_response(error)

    try:
        user = _user_response(auth_session.userId)
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"User not found: {error.args[0]}",
        )

    return MeResponse(
        user=user,
        authSession=_auth_session_response(auth_session.authSessionId),
        currentWorkspaceContext=_current_workspace_context_response(
            user_id=auth_session.userId,
            current_workspace_id=auth_session.currentWorkspaceId,
        ),
    )


@router.get(
    "/workspaces",
    response_model=WorkspaceListResponse,
    responses=AUTH_ERROR_RESPONSES,
)
def list_workspaces(request: Request) -> WorkspaceListResponse | JSONResponse:
    """List the current user's workspace memberships and workspace names."""

    try:
        auth_session = resolve_authenticated_session(request)
    except AuthContextResolutionError as error:
        return _auth_context_error_response(error)

    try:
        return _workspace_list_response(auth_session.userId)
    except KeyError as error:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Workspace not found: {error.args[0]}",
        )


@router.post(
    "/auth/select-workspace",
    response_model=SelectWorkspaceResponse,
    responses=AUTH_ERROR_RESPONSES,
)
def select_workspace(
    request: Request,
    payload: SelectWorkspaceRequest,
) -> SelectWorkspaceResponse | JSONResponse:
    """Update the current workspace on the authenticated session after membership checks."""

    try:
        auth_session = resolve_authenticated_session(request)
    except AuthContextResolutionError as error:
        return _auth_context_error_response(error)

    membership_repository = WorkspaceMembershipRepository(_runtime_foundation_database())
    try:
        membership_repository.get_by_user_id_and_workspace_id(
            auth_session.userId,
            payload.workspaceId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=403,
            error_code="FORBIDDEN",
            message=f"Workspace membership not found: {payload.workspaceId}",
        )

    updated_at = utc_timestamp()
    auth_session_repository = AuthSessionRepository(_runtime_foundation_database())
    auth_session_repository.update_current_workspace(
        auth_session_id=auth_session.authSessionId,
        current_workspace_id=payload.workspaceId,
        updated_at=updated_at,
    )

    current_workspace_context = CurrentWorkspaceContextRepository(
        _runtime_foundation_database()
    ).get_by_user_id_and_workspace_id(auth_session.userId, payload.workspaceId)
    return SelectWorkspaceResponse(
        authSession=_auth_session_response(auth_session.authSessionId),
        currentWorkspaceContext=CurrentWorkspaceContextResponse.model_validate(
            current_workspace_context
        ),
    )


@router.post(
    "/auth/logout",
    response_model=LogoutResponse,
    responses=AUTH_ERROR_RESPONSES,
)
def logout(request: Request, response: Response) -> LogoutResponse | JSONResponse:
    """Revoke the authenticated session and clear the opaque cookie."""

    try:
        auth_session = resolve_authenticated_session(request)
    except AuthContextResolutionError as error:
        return _auth_context_error_response(error)

    now = utc_timestamp()
    AuthSessionRepository(_runtime_foundation_database()).revoke(
        auth_session_id=auth_session.authSessionId,
        revoked_at=now,
        updated_at=now,
    )
    clear_auth_session_cookie(response)
    return LogoutResponse(success=True)
