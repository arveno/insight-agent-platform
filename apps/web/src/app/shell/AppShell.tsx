import { useMemo, useState } from "react";
import { Button, Divider, Popover, Segmented, Space, Typography, theme } from "antd";

import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../providers/AppThemeProvider";
import { AppIcon } from "../../shared/icons/AppIcon";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localeOptions } from "../../shared/i18n/localeTypes";
import type { AppLocale } from "../../shared/i18n/localeTypes";
import type { ShellRegionSlots } from "../../shared/layout/ShellRegionSlots";
import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import type { ThemeMode } from "../../shared/theme/themeTypes";
import type { StaticRouteKey } from "../../shared/navigation/navigationTypes";
import { useAnalysisShellSlots } from "../../modules/analysis/hooks/useAnalysisShellSlots";
import { useDataKnowledgeShellSlots } from "../../modules/data-knowledge/hooks/useDataKnowledgeShellSlots";
import { useMetricsShellSlots } from "../../modules/metrics/hooks/useMetricsShellSlots";
import { useReportsShellSlots } from "../../modules/reports/hooks/useReportsShellSlots";

import { appShellStaticViewModel } from "./fixtures/appShellStaticViewModel";

import { AppShellLayout } from "./AppShellLayout";
import { HeaderBar } from "./HeaderBar";
import { LeftNav } from "./LeftNav";

const moduleShellRoutes = [
  "analysis",
  "reports",
  "data-knowledge",
  "metrics"
] as const satisfies StaticRouteKey[];

type LeftNavMode = "root" | StaticRouteKey;
type ModuleShellRouteKey = (typeof moduleShellRoutes)[number];

function hasModuleShellLeftNav(route: StaticRouteKey): route is ModuleShellRouteKey {
  return moduleShellRoutes.includes(route as ModuleShellRouteKey);
}

export function AppShell() {
  const { locale, setLocale, t } = useI18n();
  const { setThemeMode, themeMode } = useAppTheme();
  const { token } = theme.useToken();
  const [activeRoute, setActiveRoute] = useState<StaticRouteKey>(
    appShellStaticViewModel.currentRoute
  );
  const [leftNavMode, setLeftNavMode] = useState<LeftNavMode>(
    hasModuleShellLeftNav(appShellStaticViewModel.currentRoute)
      ? appShellStaticViewModel.currentRoute
      : "root"
  );
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    appShellStaticViewModel.workspace.workspaceId
  );
  const [workspaceRefreshFeedback, setWorkspaceRefreshFeedback] = useState(false);
  const selectedWorkspace =
    appShellStaticViewModel.workspaces.find(
      (workspace) => workspace.workspaceId === selectedWorkspaceId
    ) ?? appShellStaticViewModel.workspace;
  const ActivePage = webCompositionRoutes[activeRoute];
  const handleNavigate = (route: StaticRouteKey) => {
    setActiveRoute(route);
    setLeftNavMode(hasModuleShellLeftNav(route) ? route : "root");
  };
  const analysisShellSlots = useAnalysisShellSlots({
    onBackToRoot: () => setLeftNavMode("root"),
    onNavigate: handleNavigate,
    workspaceName: selectedWorkspace.name
  });
  const reportsShellSlots = useReportsShellSlots({
    onBackToRoot: () => setLeftNavMode("root"),
    onNavigate: handleNavigate
  });
  const dataKnowledgeShellSlots = useDataKnowledgeShellSlots({
    onBackToRoot: () => setLeftNavMode("root"),
    onNavigate: handleNavigate,
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });
  const metricsShellSlots = useMetricsShellSlots({
    onBackToRoot: () => setLeftNavMode("root"),
    onNavigate: handleNavigate,
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });
  const shellSlotsByRoute: Partial<Record<StaticRouteKey, ShellRegionSlots>> = {
    analysis: analysisShellSlots,
    reports: reportsShellSlots,
    "data-knowledge": dataKnowledgeShellSlots,
    metrics: metricsShellSlots
  };
  const activeShellSlots = shellSlotsByRoute[activeRoute];
  const navigationGroups = useMemo(
    () =>
      createNavigationGroups(t, appShellStaticViewModel.navigationGroups).map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          showEntryArrow:
            hasModuleShellLeftNav(item.key as StaticRouteKey) &&
            Boolean(shellSlotsByRoute[item.key as StaticRouteKey]?.leftNav)
        }))
      })),
    [shellSlotsByRoute, t]
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
          {appShellStaticViewModel.currentUser.displayName}
        </Typography.Text>
        <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
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
          onOpenWorkspaceManagement={() => handleNavigate("workspace")}
          onSelectWorkspace={(workspaceId) => {
            if (workspaceId === selectedWorkspaceId) {
              return;
            }

            setSelectedWorkspaceId(workspaceId);
            setWorkspaceRefreshFeedback(true);
          }}
          selectedWorkspaceId={selectedWorkspaceId}
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
            {activeShellSlots?.leftNav && leftNavMode === activeRoute ? (
              activeShellSlots.leftNav
            ) : (
              <LeftNav
                groups={navigationGroups}
                onSelect={(key) => handleNavigate(key as StaticRouteKey)}
                selectedKey={selectedNavigationKey}
              />
            )}
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
                    {appShellStaticViewModel.currentUser.displayName}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                    {appShellStaticViewModel.currentUser.roleLabel}
                  </Typography.Text>
                </Space>
              </Button>
            </Popover>
          </div>
        </div>
      }
      rightAssistPanel={activeShellSlots?.rightAssistPanel ?? null}
    >
      {activeShellSlots?.mainContent ?? (
        <ActivePage key={`${selectedWorkspace.workspaceId}:${activeRoute}`} onNavigate={handleNavigate} />
      )}
    </AppShellLayout>
  );
}
