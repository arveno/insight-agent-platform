export type AuthUserViewModel = {
  displayName: string;
  email: string;
  userId: string;
};

export type AuthWorkspaceOptionViewModel = {
  membershipId: string;
  name: string;
  role: string;
  workspaceId: string;
};

export type AuthSessionViewModel = {
  currentWorkspace: AuthWorkspaceOptionViewModel | null;
  user: AuthUserViewModel;
  workspaces: AuthWorkspaceOptionViewModel[];
};
