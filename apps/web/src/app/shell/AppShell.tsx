import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, Divider, Popover, Segmented, Space, Typography, theme } from "antd";

import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../providers/AppThemeProvider";
import type { AuthSessionViewModel } from "../providers/authViewModel";
import { AppIcon } from "../../shared/icons/AppIcon";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localeOptions } from "../../shared/i18n/localeTypes";
import type { AppLocale } from "../../shared/i18n/localeTypes";
import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import type { ThemeMode } from "../../shared/theme/themeTypes";
import type { AppRouteState, StaticRouteKey } from "../../shared/navigation/navigationTypes";

import { appShellStaticViewModel } from "./fixtures/appShellStaticViewModel";

import { HeaderBar } from "./HeaderBar";
import { LeftNav } from "./LeftNav";
import { RouteShellOutlet, hasModuleShellRoute } from "./RouteShellOutlet";

type LeftNavMode = "root" | StaticRouteKey;

type AppShellProps = {
  currentRoute?: StaticRouteKey;
  onLogout?: () => void;
  onNavigate?: (route: StaticRouteKey, routeState?: AppRouteState) => void;
  onOpenWorkspaceSelection?: () => void;
  routeState?: AppRouteState;
  session: AuthSessionViewModel & {
    currentWorkspace: NonNullable<AuthSessionViewModel["currentWorkspace"]>;
  };
};

export function AppShell({
  currentRoute,
  onLogout,
  onNavigate,
  onOpenWorkspaceSelection,
  routeState,
  session
}: AppShellProps) {
  const { locale, setLocale, t } = useI18n();
  const { setThemeMode, themeMode } = useAppTheme();
  const { token } = theme.useToken();
  const [uncontrolledRoute, setUncontrolledRoute] = useState<StaticRouteKey>(
    currentRoute ?? appShellStaticViewModel.currentRoute
  );
  const [uncontrolledRouteState, setUncontrolledRouteState] = useState<AppRouteState | undefined>(
    routeState
  );
  const activeRoute = currentRoute ?? uncontrolledRoute;
  const activeRouteState = routeState ?? uncontrolledRouteState;
  const [leftNavMode, setLeftNavMode] = useState<LeftNavMode>(
    hasModuleShellRoute(activeRoute) ? activeRoute : "root"
  );

  useEffect(() => {
    setLeftNavMode(hasModuleShellRoute(activeRoute) ? activeRoute : "root");
  }, [activeRoute]);

  const ActivePage = webCompositionRoutes[activeRoute];
  const handleNavigate = (route: StaticRouteKey, nextRouteState?: AppRouteState) => {
    setLeftNavMode(hasModuleShellRoute(route) ? route : "root");

    if (onNavigate) {
      onNavigate(route, nextRouteState);
      return;
    }

    setUncontrolledRoute(route);
    setUncontrolledRouteState(nextRouteState);
  };
  const navigationGroups = useMemo(
    () =>
      createNavigationGroups(t, appShellStaticViewModel.navigationGroups).map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          showEntryArrow: hasModuleShellRoute(item.key as StaticRouteKey)
        }))
      })),
    [t]
  );
  const selectedNavigationKey = navigationGroups.some((group) =>
    group.items.some((item) => item.key === activeRoute)
  )
    ? leftNavMode === "root"
      ? activeRoute
      : undefined
    : undefined;
  const userPreferenceContent = (
    <Space
      direction="vertical"
      size={shellThemeTokens.shellSectionGap}
      style={{ minWidth: shellThemeTokens.popoverMinWidth }}
    >
      <Space direction="vertical" size={4}>
        <Typography.Text style={shellTypographyStyles.cardTitle}>
          {session.user.displayName}
        </Typography.Text>
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
          {session.currentWorkspace.role}
        </Typography.Text>
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
          {session.user.email}
        </Typography.Text>
      </Space>
      <Divider style={{ margin: 0 }} />
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{t("language")}</Typography.Text>
          <Segmented
            block
            onChange={(value) => setLocale(value as AppLocale)}
            options={localeOptions}
            value={locale}
          />
        </Space>
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{t("theme")}</Typography.Text>
          <Segmented
            block
            onChange={(value) => setThemeMode(value as ThemeMode)}
            options={[
              { label: t("themeMode.system"), value: "system" },
              { label: t("themeMode.light"), value: "light" },
              { label: t("themeMode.dark"), value: "dark" }
            ]}
            value={themeMode}
          />
        </Space>
      </Space>
    </Space>
  );
  const header = (
    <HeaderBar
      currentUserEmail={session.user.email}
      currentUserName={session.user.displayName}
      currentUserRole={session.currentWorkspace.role}
      currentWorkspaceName={session.currentWorkspace.name}
      logoutLabel="退出登录"
      onLogout={onLogout}
      onOpenWorkspaceSelection={onOpenWorkspaceSelection}
      workspaceSwitchLabel="切换工作区"
    />
  );
  const rootLeftNavContent = (
    <LeftNav
      groups={navigationGroups}
      onSelect={(key) => handleNavigate(key as StaticRouteKey)}
      selectedKey={selectedNavigationKey}
    />
  );
  const renderLeftNav = (content: ReactNode) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%"
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          paddingBlock: shellThemeTokens.panelPadding,
          paddingInline: shellThemeTokens.headerPaddingInline
        }}
      >
        <Typography.Text
          style={{
            ...shellTypographyStyles.cardTitle,
            color: token.colorText,
            display: "inline-flex",
            letterSpacing: -0.2
          }}
        >
          <AppIcon name="dashboard" title={t("appName")} variant="badge" />
          {t("appName")}
        </Typography.Text>
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, overflowX: "hidden", overflowY: "auto" }}>
        {content}
      </div>
      <div
        style={{
          borderTop: `${shellThemeTokens.surfaceBorderWidth}px solid ${token.colorBorderSecondary}`,
          flex: "0 0 auto",
          padding: shellThemeTokens.shellFooterPadding
        }}
      >
        <Popover
          content={userPreferenceContent}
          placement="topLeft"
          title={t("userMenu")}
          trigger="click"
        >
          <Button
            block
            style={{
              ...shellTypographyStyles.buttonLabel,
              height: "auto",
              justifyContent: "flex-start",
              paddingBlock: shellThemeTokens.userButtonPaddingBlock,
              paddingInline: shellThemeTokens.userButtonPaddingInline
            }}
            type="default"
          >
            <Space direction="vertical" size={2} style={{ width: "100%" }}>
              <Typography.Text style={shellTypographyStyles.cardTitle}>
                {session.user.displayName}
              </Typography.Text>
              <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                {session.currentWorkspace.role}
              </Typography.Text>
            </Space>
          </Button>
        </Popover>
      </div>
    </div>
  );
  const defaultMainContent = (
    <ActivePage
      key={`${session.currentWorkspace.workspaceId}:${activeRoute}`}
      onNavigate={handleNavigate}
      routeState={activeRouteState}
    />
  );

  return (
    <RouteShellOutlet
      activeRoute={activeRoute}
      routeState={activeRouteState}
      defaultMainContent={defaultMainContent}
      header={header}
      leftNavMode={leftNavMode}
      onBackToRoot={() => setLeftNavMode("root")}
      onNavigate={handleNavigate}
      renderLeftNav={renderLeftNav}
      rootLeftNavContent={rootLeftNavContent}
      selectedBusinessDomainId={appShellStaticViewModel.selectedBusinessDomainId}
      selectedWorkspace={{
        name: session.currentWorkspace.name,
        workspaceId: session.currentWorkspace.workspaceId
      }}
    />
  );
}
