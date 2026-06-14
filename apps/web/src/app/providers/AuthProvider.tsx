import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LoginRequest } from "@insight-agent/contracts/generated/typescript";

import {
  applyWorkspaceSelectionToSession,
  hydrateSessionAfterLogin,
  loadAppAuthSession
} from "../../api/adapters/loadAppAuthSession";
import { AgentRuntimeClient, RuntimeApiError } from "../../api/client/agentRuntimeClient";

import type { AuthSessionViewModel } from "./authViewModel";

type AuthState =
  | {
      kind: "authenticated";
      session: AuthSessionViewModel;
    }
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "loading";
    }
  | {
      kind: "unauthenticated";
    };

type AuthContextValue = {
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  state: AuthState;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  client?: AgentRuntimeClient;
};

export function AuthProvider({ children, client = new AgentRuntimeClient() }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ kind: "loading" });

  const refresh = async () => {
    setState({ kind: "loading" });

    try {
      const session = await loadAppAuthSession(client);
      setState({ kind: "authenticated", session });
    } catch (error) {
      if (error instanceof RuntimeApiError && error.status === 401) {
        setState({ kind: "unauthenticated" });
        return;
      }

      setState({
        kind: "error",
        message:
          error instanceof Error ? error.message : "暂时无法加载当前登录状态，请稍后重试。"
      });
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      login: async (payload) => {
        const response = await client.login(payload);
        const session = await hydrateSessionAfterLogin(response, client);
        setState({ kind: "authenticated", session });
      },
      logout: async () => {
        try {
          await client.logout();
        } finally {
          setState({ kind: "unauthenticated" });
        }
      },
      refresh,
      selectWorkspace: async (workspaceId) => {
        const currentState = state;
        if (currentState.kind !== "authenticated") {
          throw new Error("Current session is not authenticated.");
        }

        const response = await client.selectWorkspace({ workspaceId });

        setState({
          kind: "authenticated",
          session: applyWorkspaceSelectionToSession(currentState.session, response)
        });
      },
      state
    }),
    [client, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
