import type {
  CurrentWorkspaceContext,
  LoginResponse,
  MeResponse,
  SelectWorkspaceResponse,
  WorkspaceListResponse
} from "@insight-agent/contracts/generated/typescript";

import type {
  AuthSessionViewModel,
  AuthWorkspaceOptionViewModel
} from "../../app/providers/authViewModel";
import { AgentRuntimeClient } from "../client/agentRuntimeClient";

function mapWorkspaceOptions(response: WorkspaceListResponse): AuthWorkspaceOptionViewModel[] {
  return response.items.map((item) => ({
    membershipId: item.membership.membershipId,
    name: item.workspace.name,
    role: item.membership.role,
    workspaceId: item.workspace.workspaceId
  }));
}

function resolveCurrentWorkspace(
  currentWorkspaceContext: CurrentWorkspaceContext | null,
  workspaces: AuthWorkspaceOptionViewModel[]
): AuthWorkspaceOptionViewModel | null {
  if (!currentWorkspaceContext) {
    return null;
  }

  return (
    workspaces.find(
      (workspace) =>
        workspace.membershipId === currentWorkspaceContext.membershipId &&
        workspace.workspaceId === currentWorkspaceContext.workspaceId &&
        workspace.role === currentWorkspaceContext.role
    ) ??
    workspaces.find((workspace) => workspace.workspaceId === currentWorkspaceContext.workspaceId) ??
    null
  );
}

export function mapAuthSessionViewModel(
  input: {
    currentWorkspaceContext: CurrentWorkspaceContext | null;
    displayName: string;
    email: string;
    userId: string;
  },
  workspaces: WorkspaceListResponse
): AuthSessionViewModel {
  const workspaceOptions = mapWorkspaceOptions(workspaces);

  return {
    currentWorkspace: resolveCurrentWorkspace(input.currentWorkspaceContext, workspaceOptions),
    user: {
      displayName: input.displayName,
      email: input.email,
      userId: input.userId
    },
    workspaces: workspaceOptions
  };
}

export async function loadAppAuthSession(
  client = new AgentRuntimeClient()
): Promise<AuthSessionViewModel> {
  const [meResponse, workspaceResponse] = await Promise.all([client.getMe(), client.listWorkspaces()]);

  return mapAuthSessionViewModel(
    {
      currentWorkspaceContext: meResponse.currentWorkspaceContext,
      displayName: meResponse.user.displayName,
      email: meResponse.user.email,
      userId: meResponse.user.userId
    },
    workspaceResponse
  );
}

export async function hydrateSessionAfterLogin(
  response: LoginResponse,
  client = new AgentRuntimeClient()
): Promise<AuthSessionViewModel> {
  const workspaceResponse = await client.listWorkspaces();

  return mapAuthSessionViewModel(
    {
      currentWorkspaceContext: response.currentWorkspaceContext,
      displayName: response.user.displayName,
      email: response.user.email,
      userId: response.user.userId
    },
    workspaceResponse
  );
}

export function applyWorkspaceSelectionToSession(
  session: AuthSessionViewModel,
  response: SelectWorkspaceResponse
): AuthSessionViewModel {
  return {
    ...session,
    currentWorkspace: resolveCurrentWorkspace(response.currentWorkspaceContext, session.workspaces)
  };
}
