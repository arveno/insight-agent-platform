import { useMemo, useState } from "react";
import { Button, Divider, Popover, Segmented, Space, Typography, theme } from "antd";

import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../providers/AppThemeProvider";
import { AppIcon } from "../../shared/icons/AppIcon";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { localeOptions } from "../../shared/i18n/localeTypes";
import type { AppLocale } from "../../shared/i18n/localeTypes";
import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import type { ThemeMode } from "../../shared/theme/themeTypes";
import { useAnalysisWorkspaceSlots } from "../../modules/analysis/hooks/useAnalysisWorkspaceSlots";
import { DataKnowledgeListNav } from "../../modules/data-knowledge/navigation/DataKnowledgeListNav";
import { useDataKnowledgeOverviewState } from "../../modules/data-knowledge/hooks/useDataKnowledgeOverviewState";
import { DataKnowledgeInspectorPanel } from "../../modules/data-knowledge/panels/DataKnowledgeInspectorPanel";
import { MetricsListNav } from "../../modules/metrics/navigation/MetricsListNav";
import { useMetricsOverviewState } from "../../modules/metrics/hooks/useMetricsOverviewState";
import { usePlatformOperationsOverviewState } from "../../modules/platform-operations/hooks/usePlatformOperationsOverviewState";
import { ReportsListNav } from "../../modules/reports/navigation/ReportsListNav";
import { ReportsInspectorPanel } from "../../modules/reports/panels/ReportsInspectorPanel";
import { useReportsReaderState } from "../../modules/reports/hooks/useReportsReaderState";
import type { StaticRouteKey } from "../../shared/navigation/navigationTypes";

import { appShellStaticViewModel } from "./fixtures/appShellStaticViewModel";

import { AppShellInspector } from "./AppShellInspector";
import { AppShellLayout } from "./AppShellLayout";
import { HeaderBar } from "./HeaderBar";
import { LeftNav } from "./LeftNav";

export function AppShell() {
  const { locale, setLocale, t } = useI18n();
  const { setThemeMode, themeMode } = useAppTheme();
  const { token } = theme.useToken();
  const [activeRoute, setActiveRoute] = useState<StaticRouteKey>(
    appShellStaticViewModel.currentRoute
  );
  const [leftNavMode, setLeftNavMode] = useState<
    "analysis" | "data-knowledge" | "metrics" | "reports" | "root"
  >(
    appShellStaticViewModel.currentRoute === "analysis" ? "analysis" : "root"
  );
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    appShellStaticViewModel.workspace.workspaceId
  );
  const [workspaceRefreshFeedback, setWorkspaceRefreshFeedback] = useState(false);
  const selectedWorkspace =
    appShellStaticViewModel.workspaces.find(
      (workspace) => workspace.workspaceId === selectedWorkspaceId
    ) ?? appShellStaticViewModel.workspace;
  const dataKnowledgeOverviewState = useDataKnowledgeOverviewState({
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });
  const metricsOverviewState = useMetricsOverviewState({
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });
  const platformOperationsOverviewState = usePlatformOperationsOverviewState({
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });
  const reportsReaderState = useReportsReaderState();
  const ActivePage = webCompositionRoutes[activeRoute];
  const activeInspector = appShellStaticViewModel.inspectorByRoute[activeRoute];
  const analysisWorkspaceSlots = useAnalysisWorkspaceSlots({
    onBackToRoot: () => setLeftNavMode("root"),
    workspaceName: selectedWorkspace.name
  });
  const navigationGroups = useMemo(
    () => createNavigationGroups(t, appShellStaticViewModel.navigationGroups),
    [t]
  );
  const selectedNavigationKey = navigationGroups.some((group) =>
    group.items.some((item) => item.key === activeRoute)
  )
    ? leftNavMode === "root"
      ? activeRoute
      : undefined
    : undefined;
  const handleNavigate = (route: StaticRouteKey) => {
    setActiveRoute(route);
    setLeftNavMode(
      route === "analysis"
        ? "analysis"
        : route === "data-knowledge"
          ? "data-knowledge"
          : route === "metrics"
            ? "metrics"
            : route === "reports"
              ? "reports"
              : "root"
    );

    if (route !== "data-knowledge") {
      dataKnowledgeOverviewState.onSearchChange("");
    }

    if (route !== "metrics") {
      metricsOverviewState.onSearchChange("");
    }

    if (route !== "reports") {
      reportsReaderState.onSearchChange("");
    }
  };
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
            {activeRoute === "analysis" && leftNavMode === "analysis" ? (
              analysisWorkspaceSlots.leftNav
            ) : activeRoute === "reports" && leftNavMode === "reports" ? (
              <ReportsListNav
                controller={reportsReaderState}
                onBack={() => setLeftNavMode("root")}
              />
            ) : activeRoute === "data-knowledge" && leftNavMode === "data-knowledge" ? (
              <DataKnowledgeListNav
                controller={dataKnowledgeOverviewState}
                onBack={() => setLeftNavMode("root")}
              />
            ) : activeRoute === "metrics" && leftNavMode === "metrics" ? (
              <MetricsListNav
                controller={metricsOverviewState}
                onBack={() => setLeftNavMode("root")}
              />
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
      rightAssistPanel={
        activeRoute === "analysis" ? (
          analysisWorkspaceSlots.rightAssistPanel
        ) : activeRoute === "reports" ? (
          <ReportsInspectorPanel
            reportSections={reportsReaderState.viewModel.reportSections}
            selectedReport={reportsReaderState.viewModel.selectedReport}
            workspaceName={selectedWorkspace.name}
          />
        ) : activeRoute === "data-knowledge" ? (
          <DataKnowledgeInspectorPanel
            controller={dataKnowledgeOverviewState}
            onNavigate={handleNavigate}
          />
        ) : activeRoute === "metrics" ||
          activeRoute === "platform-operations" ? null : (
          <AppShellInspector inspector={activeInspector} workspaceName={selectedWorkspace.name} />
        )
      }
    >
      {activeRoute === "analysis" ? (
        analysisWorkspaceSlots.mainContent
      ) : (
        <ActivePage
          key={`${selectedWorkspace.workspaceId}:${activeRoute}`}
          dataKnowledgeState={
            activeRoute === "data-knowledge" ? dataKnowledgeOverviewState : undefined
          }
          metricsState={activeRoute === "metrics" ? metricsOverviewState : undefined}
          onNavigate={handleNavigate}
          platformOperationsState={
            activeRoute === "platform-operations" ? platformOperationsOverviewState : undefined
          }
          reportsState={activeRoute === "reports" ? reportsReaderState : undefined}
        />
      )}
    </AppShellLayout>
  );
}
