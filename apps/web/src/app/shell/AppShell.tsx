import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { DesktopOutlined, DownOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Popover, Segmented, Space, Tag, Typography, theme } from "antd";

import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../providers/AppThemeProvider";
import type { AuthSessionViewModel } from "../providers/authViewModel";
import { AppIcon } from "../../shared/icons/AppIcon";
import { useI18n } from "../../shared/i18n/I18nProvider";
import type { AppLocale } from "../../shared/i18n/localeTypes";
import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import type { ThemeMode } from "../../shared/theme/themeTypes";
import type { AppRouteState, StaticRouteKey } from "../../shared/navigation/navigationTypes";
import { CurrentWorkspaceBindingProvider } from "../../shared/workspace/CurrentWorkspaceBindingProvider";

import { appShellStaticViewModel } from "./fixtures/appShellStaticViewModel";

import { HeaderBar } from "./HeaderBar";
import { LeftNav } from "./LeftNav";
import { RouteShellOutlet, hasModuleShellRoute } from "./RouteShellOutlet";

type LeftNavMode = "root" | StaticRouteKey;

type AppShellProps = {
  currentRoute?: StaticRouteKey;
  onLogout?: () => void;
  onNavigate?: (route: StaticRouteKey, routeState?: AppRouteState) => void;
  onSelectWorkspace?: (workspaceId: string) => Promise<void>;
  routeState?: AppRouteState;
  session: AuthSessionViewModel & {
    currentWorkspace: NonNullable<AuthSessionViewModel["currentWorkspace"]>;
  };
};

export function AppShell({
  currentRoute,
  onLogout,
  onNavigate,
  onSelectWorkspace,
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
      size={12}
      style={{ minWidth: shellThemeTokens.popoverMinWidth }}
    >
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Typography.Text style={shellTypographyStyles.cardTitle}>
          {session.user.displayName}
        </Typography.Text>
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
          {session.user.email}
        </Typography.Text>
        <Tag color="blue" style={{ marginInlineEnd: 0, width: "fit-content" }}>
          {session.currentWorkspace.role}
        </Tag>
      </Space>
      <Divider style={{ margin: 0 }} />
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between" gap={12}>
          <Typography.Text type="secondary">{t("language")}</Typography.Text>
          <Segmented
            options={[
              { label: "简中", value: "zh-CN" },
              { label: "EN", value: "en-US" }
            ]}
            onChange={(value) => setLocale(value as AppLocale)}
            size="small"
            value={locale}
          />
        </Flex>
        <Flex align="center" justify="space-between" gap={12}>
          <Typography.Text type="secondary">{t("theme")}</Typography.Text>
          <Segmented
            onChange={(value) => setThemeMode(value as ThemeMode)}
            options={[
              {
                label: <DesktopOutlined aria-label={t("themeMode.system")} />,
                value: "system"
              },
              { label: <SunOutlined aria-label={t("themeMode.light")} />, value: "light" },
              { label: <MoonOutlined aria-label={t("themeMode.dark")} />, value: "dark" }
            ]}
            size="small"
            value={themeMode}
          />
        </Flex>
        <Button
          block
          onClick={() => void onLogout?.()}
          style={{ justifyContent: "flex-start" }}
          type="text"
        >
          退出登录
        </Button>
      </Space>
    </Space>
  );
  const header = (
    <HeaderBar
      currentUserRole={session.currentWorkspace.role}
      currentWorkspaceId={session.currentWorkspace.workspaceId}
      currentWorkspaceName={session.currentWorkspace.name}
      onSelectWorkspace={onSelectWorkspace}
      workspaces={session.workspaces}
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
          styles={{
            body: {
              background: token.colorBgElevated,
              border: `${shellThemeTokens.surfaceBorderWidth}px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowSecondary
            }
          }}
          trigger="click"
        >
          <Button
            aria-label={t("userMenu")}
            block
            style={{
              alignItems: "center",
              ...shellTypographyStyles.buttonLabel,
              display: "inline-flex",
              height: "auto",
              justifyContent: "space-between",
              paddingBlock: shellThemeTokens.userButtonPaddingBlock,
              paddingInline: shellThemeTokens.userButtonPaddingInline
            }}
            type="default"
          >
            <Flex align="center" gap={10} style={{ minWidth: 0 }}>
              <Avatar
                size={28}
                style={{
                  background: token.colorFillSecondary,
                  color: token.colorText
                }}
              >
                {session.user.displayName.slice(0, 1).toUpperCase()}
              </Avatar>
              <Typography.Text ellipsis style={{ ...shellTypographyStyles.cardTitle, minWidth: 0 }}>
                {session.user.displayName}
              </Typography.Text>
            </Flex>
            <Flex align="center" gap={8}>
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                {session.currentWorkspace.role}
              </Tag>
              <DownOutlined />
            </Flex>
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
    <CurrentWorkspaceBindingProvider
      value={{
        workspaceId: session.currentWorkspace.workspaceId,
        workspaceName: session.currentWorkspace.name
      }}
    >
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
    </CurrentWorkspaceBindingProvider>
  );
}
