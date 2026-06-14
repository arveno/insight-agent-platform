import type { WorkspaceOptionViewModel } from "../../shared/workspace/workspaceOptionViewModel";

export type AuthUserViewModel = {
  displayName: string;
  email: string;
  userId: string;
};

export type AuthWorkspaceOptionViewModel = WorkspaceOptionViewModel;

export type AuthSessionViewModel = {
  currentWorkspace: AuthWorkspaceOptionViewModel | null;
  user: AuthUserViewModel;
  workspaces: AuthWorkspaceOptionViewModel[];
};
