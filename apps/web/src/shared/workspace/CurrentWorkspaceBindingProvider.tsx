import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type CurrentWorkspaceBinding = {
  workspaceId: string;
  workspaceName: string;
};

const CurrentWorkspaceBindingContext = createContext<CurrentWorkspaceBinding | null>(null);

type CurrentWorkspaceBindingProviderProps = {
  children: ReactNode;
  value: CurrentWorkspaceBinding;
};

export function CurrentWorkspaceBindingProvider({
  children,
  value
}: CurrentWorkspaceBindingProviderProps) {
  return (
    <CurrentWorkspaceBindingContext.Provider value={value}>
      {children}
    </CurrentWorkspaceBindingContext.Provider>
  );
}

export function useCurrentWorkspaceBinding(): CurrentWorkspaceBinding {
  const value = useContext(CurrentWorkspaceBindingContext);

  if (!value) {
    throw new Error("useCurrentWorkspaceBinding must be used within CurrentWorkspaceBindingProvider.");
  }

  return value;
}
