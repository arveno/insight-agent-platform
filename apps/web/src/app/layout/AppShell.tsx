import { useMemo, useState } from "react";
import { Button, Divider, Popover, Segmented, Space, Typography, theme } from "antd";

import { appShellStaticViewModel } from "../fixtures";
import type { StaticRouteKey } from "../models";
import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../theme";
import {
  AppIcon,
  AppShellLayout,
  HeaderBar,
  LeftNav,
  localeOptions,
  type AppLocale,
  type ThemeMode,
  useI18n
} from "../../shared";

import { AppShellInspector } from "./AppShellInspector";

export function AppShell() {
  const { locale, setLocale, t } = useI18n();
  const { setThemeMode, themeMode } = useAppTheme();
  const { token } = theme.useToken();
  const [activeRoute, setActiveRoute] = useState<StaticRouteKey>(
    appShellStaticViewModel.currentRoute
  );
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    appShellStaticViewModel.workspace.workspaceId
  );
  const [workspaceRefreshFeedback, setWorkspaceRefreshFeedback] = useState(false);
  const ActivePage = webCompositionRoutes[activeRoute];
  const activeInspector = appShellStaticViewModel.inspectorByRoute[activeRoute];
  const navigationGroups = useMemo(
    () => createNavigationGroups(t, appShellStaticViewModel.navigationGroups),
    [t]
  );
  const selectedWorkspace =
    appShellStaticViewModel.workspaces.find(
      (workspace) => workspace.workspaceId === selectedWorkspaceId
    ) ?? appShellStaticViewModel.workspace;
  const selectedNavigationKey = navigationGroups.some((group) =>
    group.items.some((item) => item.key === activeRoute)
  )
    ? activeRoute
    : undefined;
  const userPreferenceContent = (
    <Space direction="vertical" size={12} style={{ minWidth: 240 }}>
      <Space direction="vertical" size={4}>
        <Typography.Text strong>{appShellStaticViewModel.currentUser.displayName}</Typography.Text>
        <Typography.Text type="secondary">
          {appShellStaticViewModel.currentUser.roleLabel}
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

  return (
    <AppShellLayout
      header={
        <HeaderBar
          currentWorkspaceName={selectedWorkspace.name}
          feedback={workspaceRefreshFeedback ? t("shell.workspace.switchFeedback") : undefined}
          manageWorkspaceLabel={t("shell.workspace.manage")}
          onOpenWorkspaceManagement={() => setActiveRoute("workspace")}
          onSelectWorkspace={(workspaceId) => {
            if (workspaceId === selectedWorkspaceId) {
              return;
            }

            setSelectedWorkspaceId(workspaceId);
            setWorkspaceRefreshFeedback(true);
          }}
          selectedWorkspaceId={selectedWorkspaceId}
          workspaceLabel={t("shell.workspace.currentLabel")}
          workspaceMenuLabel={t("shell.workspace.currentLabel")}
          workspaces={appShellStaticViewModel.workspaces}
        />
      }
      leftNav={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            width: "100%"
          }}
        >
          <div style={{ flex: "0 0 auto", paddingBlock: token.paddingLG, paddingInline: 24 }}>
            <Typography.Text strong>
              <AppIcon name="dashboard" title={t("appName")} variant="badge" />
              {t("appName")}
            </Typography.Text>
          </div>
          <div style={{ flex: "1 1 auto", minHeight: 0, overflowX: "hidden", overflowY: "auto" }}>
            <LeftNav
              groups={navigationGroups}
              onSelect={(key) => setActiveRoute(key as StaticRouteKey)}
              selectedKey={selectedNavigationKey}
            />
          </div>
          <div
            style={{
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              flex: "0 0 auto",
              padding: token.padding
            }}
          >
            <Popover
              content={userPreferenceContent}
              placement="topLeft"
              title={t("userMenu")}
              trigger="click"
            >
              <Button block style={{ height: "auto", paddingBlock: token.paddingSM }}>
                <Space direction="vertical" size={2} style={{ width: "100%" }}>
                  <Typography.Text strong>
                    {appShellStaticViewModel.currentUser.displayName}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {appShellStaticViewModel.currentUser.roleLabel}
                  </Typography.Text>
                </Space>
              </Button>
            </Popover>
          </div>
        </div>
      }
      rightAssistPanel={
        <AppShellInspector inspector={activeInspector} workspaceName={selectedWorkspace.name} />
      }
    >
      <ActivePage key={`${selectedWorkspace.workspaceId}:${activeRoute}`} onNavigate={setActiveRoute} />
    </AppShellLayout>
  );
}
