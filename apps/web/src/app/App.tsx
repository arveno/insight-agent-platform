import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Button, Flex, Spin, Typography } from "antd";

import type { AppRouteState, StaticRouteKey } from "../shared/navigation/navigationTypes";
import { LoginPage } from "../modules/workspace/components/LoginPage";
import { WorkspaceSelectionPage } from "../modules/workspace/components/WorkspaceSelectionPage";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { AppProviders } from "./providers/AppProviders";
import {
  buildRoutePath,
  defaultProtectedRoute,
  resolveRouteFromPath
} from "./router/router";
import { AppShell } from "./shell/AppShell";

const loginRoutePath = "/login";
const workspaceSelectionRoutePath = "/select-workspace";

type BrowserLocationState = {
  pathname: string;
  routeState?: AppRouteState;
  search: string;
};

type NavigateUrlOptions = {
  replace?: boolean;
  routeState?: AppRouteState;
};

function readHistoryRouteState(): AppRouteState | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const state = window.history.state as { appRouteState?: AppRouteState } | null;

  return state?.appRouteState;
}

function getBrowserLocation(): BrowserLocationState {
  if (typeof window === "undefined") {
    return {
      pathname: buildRoutePath(defaultProtectedRoute),
      routeState: undefined,
      search: ""
    };
  }

  return {
    pathname: window.location.pathname,
    routeState: readHistoryRouteState(),
    search: window.location.search
  };
}

function getCurrentUrl(location: BrowserLocationState): string {
  return `${location.pathname}${location.search}`;
}

function normalizeRedirectTarget(redirect: string | null): string | null {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return null;
  }

  return redirect;
}

function readRedirectTarget(search: string): string | null {
  return normalizeRedirectTarget(new URLSearchParams(search).get("redirect"));
}

function buildLoginUrl(redirect: string | null): string {
  const params = new URLSearchParams();

  if (redirect) {
    params.set("redirect", redirect);
  }

  const query = params.toString();

  return query ? `${loginRoutePath}?${query}` : loginRoutePath;
}

function buildWorkspaceSelectionUrl(redirect: string | null): string {
  const params = new URLSearchParams();

  if (redirect) {
    params.set("redirect", redirect);
  }

  const query = params.toString();

  return query ? `${workspaceSelectionRoutePath}?${query}` : workspaceSelectionRoutePath;
}

function resolvePostSelectionTarget(redirect: string | null): string {
  if (
    redirect &&
    redirect !== "/" &&
    redirect !== loginRoutePath &&
    !redirect.startsWith(`${loginRoutePath}?`) &&
    redirect !== workspaceSelectionRoutePath &&
    !redirect.startsWith(`${workspaceSelectionRoutePath}?`)
  ) {
    return redirect;
  }

  return buildRoutePath(defaultProtectedRoute);
}

function AuthStatusPage({
  action,
  description,
  title
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <Flex align="center" justify="center" style={{ minHeight: "100%" }}>
        <Flex
          align="center"
          gap={16}
          style={{ maxWidth: 480, textAlign: "center", width: "100%" }}
          vertical
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary">{description}</Typography.Text>
          {action}
        </Flex>
      </Flex>
    </main>
  );
}

function RouteRedirect({
  onNavigateUrl,
  replace = true,
  to
}: {
  onNavigateUrl: (url: string, options?: NavigateUrlOptions) => void;
  replace?: boolean;
  to: string;
}) {
  useEffect(() => {
    onNavigateUrl(to, { replace });
  }, [onNavigateUrl, replace, to]);

  return null;
}

function AppRouter() {
  const { login, logout, refresh, selectWorkspace, state: authState } = useAuth();
  const [location, setLocation] = useState<BrowserLocationState>(() => getBrowserLocation());

  useEffect(() => {
    const handlePopState = () => {
      setLocation(getBrowserLocation());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateUrl = (url: string, options: NavigateUrlOptions = {}) => {
    const nextState = options.routeState ? { appRouteState: options.routeState } : null;
    const method = options.replace ? "replaceState" : "pushState";

    window.history[method](nextState, "", url);
    setLocation(getBrowserLocation());
  };

  const navigateToRoute = (route: StaticRouteKey, routeState?: AppRouteState) => {
    navigateUrl(buildRoutePath(route), { routeState });
  };

  const redirectTarget = readRedirectTarget(location.search);
  const protectedRoute = resolveRouteFromPath(location.pathname);

  if (authState.kind === "loading") {
    return (
      <AuthStatusPage
        action={<Spin size="large" />}
        description="正在检查当前登录状态与 workspace session。"
        title="正在准备登录上下文"
      />
    );
  }

  if (authState.kind === "error") {
    return (
      <AuthStatusPage
        action={
          <Flex align="center" gap={12} vertical>
            <Alert message={authState.message} showIcon type="error" />
            <Button onClick={() => void refresh()} type="primary">
              重新加载
            </Button>
          </Flex>
        }
        description="暂时无法读取当前登录状态。"
        title="登录状态加载失败"
      />
    );
  }

  if (location.pathname === loginRoutePath) {
    if (authState.kind === "unauthenticated") {
      return (
        <LoginPage
          onLogin={async (payload) => {
            await login(payload);
            navigateUrl(
              buildWorkspaceSelectionUrl(redirectTarget ?? buildRoutePath(defaultProtectedRoute)),
              { replace: true }
            );
          }}
        />
      );
    }

    return (
      <RouteRedirect
        onNavigateUrl={navigateUrl}
        to={buildWorkspaceSelectionUrl(redirectTarget ?? buildRoutePath(defaultProtectedRoute))}
      />
    );
  }

  if (location.pathname === workspaceSelectionRoutePath) {
    if (authState.kind === "unauthenticated") {
      return (
        <RouteRedirect
          onNavigateUrl={navigateUrl}
          to={buildLoginUrl(redirectTarget ?? buildRoutePath(defaultProtectedRoute))}
        />
      );
    }

    return (
      <WorkspaceSelectionPage
        currentWorkspaceId={authState.session.currentWorkspace?.workspaceId ?? null}
        displayName={authState.session.user.displayName}
        onSelectWorkspace={async (workspaceId) => {
          await selectWorkspace(workspaceId);
          navigateUrl(resolvePostSelectionTarget(redirectTarget), { replace: true });
        }}
        workspaces={authState.session.workspaces}
      />
    );
  }

  if (!protectedRoute) {
    if (authState.kind === "unauthenticated") {
      return <RouteRedirect onNavigateUrl={navigateUrl} to={buildLoginUrl(null)} />;
    }

    if (!authState.session.currentWorkspace) {
      return (
        <RouteRedirect
          onNavigateUrl={navigateUrl}
          to={buildWorkspaceSelectionUrl(buildRoutePath(defaultProtectedRoute))}
        />
      );
    }

    return (
      <RouteRedirect
        onNavigateUrl={navigateUrl}
        to={buildRoutePath(defaultProtectedRoute)}
      />
    );
  }

  if (authState.kind === "unauthenticated") {
    return (
      <RouteRedirect onNavigateUrl={navigateUrl} to={buildLoginUrl(getCurrentUrl(location))} />
    );
  }

  if (!authState.session.currentWorkspace) {
    return (
      <RouteRedirect
        onNavigateUrl={navigateUrl}
        to={buildWorkspaceSelectionUrl(getCurrentUrl(location))}
      />
    );
  }

  return (
    <AppShell
      key={authState.session.currentWorkspace.membershipId}
      currentRoute={protectedRoute}
      onLogout={async () => {
        await logout();
        navigateUrl(buildLoginUrl(null), { replace: true });
      }}
      onNavigate={navigateToRoute}
      onOpenWorkspaceSelection={() => {
        navigateUrl(buildWorkspaceSelectionUrl(buildRoutePath(protectedRoute)));
      }}
      routeState={location.routeState}
      session={{
        ...authState.session,
        currentWorkspace: authState.session.currentWorkspace
      }}
    />
  );
}

export function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </AppProviders>
  );
}
