import { useMemo, useState } from "react";
import { Button, Divider, Popover, Segmented, Space, Typography, theme } from "antd";

import { appShellStaticViewModel } from "../fixtures";
import type { StaticRouteKey } from "../models";
import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../theme";
import { useAnalysisConversationState } from "../../features/agent-analysis/hooks/useAnalysisConversationState";
import { useMetricsOverviewState } from "../../features/metrics/hooks";
import { useReportsReaderState } from "../../features/reports/hooks";
import { analysisStaticViewModel } from "../../features/static-view-models";
import { AnalysisPageContent } from "../../pages/analysis/Page";
import {
  AppIcon,
  AppShellLayout,
  HeaderBar,
  LeftNav,
  localeOptions,
  shellThemeTokens,
  shellTypographyStyles,
  type AppLocale,
  type ThemeMode,
  useI18n
} from "../../shared";

import { AnalysisInspectorPanel } from "./AnalysisInspectorPanel";
import { AnalysisSessionNav } from "./AnalysisSessionNav";
import { AppShellInspector } from "./AppShellInspector";
import { MetricsListNav } from "./MetricsListNav";
import { ReportsInspectorPanel } from "./ReportsInspectorPanel";
import { ReportsListNav } from "./ReportsListNav";

export function AppShell() {
  const { locale, setLocale, t } = useI18n();
  const { setThemeMode, themeMode } = useAppTheme();
  const { token } = theme.useToken();
  const [activeRoute, setActiveRoute] = useState<StaticRouteKey>(
    appShellStaticViewModel.currentRoute
  );
  const [leftNavMode, setLeftNavMode] = useState<"analysis" | "metrics" | "reports" | "root">(
    appShellStaticViewModel.currentRoute === "analysis" ? "analysis" : "root"
  );
  const [analysisSessionQuery, setAnalysisSessionQuery] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    appShellStaticViewModel.workspace.workspaceId
  );
  const [workspaceRefreshFeedback, setWorkspaceRefreshFeedback] = useState(false);
  const selectedWorkspace =
    appShellStaticViewModel.workspaces.find(
      (workspace) => workspace.workspaceId === selectedWorkspaceId
    ) ?? appShellStaticViewModel.workspace;
  const analysisConversationState = useAnalysisConversationState();
  const metricsOverviewState = useMetricsOverviewState({
    workspaceId: selectedWorkspace.workspaceId,
    workspaceName: selectedWorkspace.name
  });
  const reportsReaderState = useReportsReaderState();
  const ActivePage = webCompositionRoutes[activeRoute];
  const activeInspector = appShellStaticViewModel.inspectorByRoute[activeRoute];
  const navigationGroups = useMemo(
    () => createNavigationGroups(t, appShellStaticViewModel.navigationGroups),
    [t]
  );
  const filteredAnalysisSessions = useMemo(() => {
    const normalizedQuery = analysisSessionQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return analysisStaticViewModel.sessions;
    }

    return analysisStaticViewModel.sessions.filter((session) =>
      session.session.title.toLowerCase().includes(normalizedQuery)
    );
  }, [analysisSessionQuery]);
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
      route === "analysis" ? "analysis" : route === "metrics" ? "metrics" : route === "reports" ? "reports" : "root"
    );

    if (route !== "analysis") {
      setAnalysisSessionQuery("");
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
              <AnalysisSessionNav
                onBack={() => setLeftNavMode("root")}
                onCreateNewAnalysis={() => {
                  setActiveRoute("analysis");
                  setLeftNavMode("analysis");
                  setAnalysisSessionQuery("");
                  analysisConversationState.onResetForNewAnalysis();
                }}
                onSearchChange={setAnalysisSessionQuery}
                onSelectSession={(sessionKey) => {
                  setActiveRoute("analysis");
                  setLeftNavMode("analysis");
                  analysisConversationState.onSelectSession(sessionKey);
                }}
                searchValue={analysisSessionQuery}
                selectedSessionKey={analysisConversationState.selectedSessionKey}
                sessions={filteredAnalysisSessions}
              />
            ) : activeRoute === "reports" && leftNavMode === "reports" ? (
              <ReportsListNav
                controller={reportsReaderState}
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
          <AnalysisInspectorPanel
            conversationState={analysisConversationState}
            workspaceName={selectedWorkspace.name}
          />
        ) : activeRoute === "reports" ? (
          <ReportsInspectorPanel
            reportSections={reportsReaderState.viewModel.reportSections}
            selectedReport={reportsReaderState.viewModel.selectedReport}
            workspaceName={selectedWorkspace.name}
          />
        ) : (
          <AppShellInspector inspector={activeInspector} workspaceName={selectedWorkspace.name} />
        )
      }
    >
      {activeRoute === "analysis" ? (
        <AnalysisPageContent
          conversationState={analysisConversationState}
          key={`${selectedWorkspace.workspaceId}:${activeRoute}`}
          onNavigate={handleNavigate}
        />
      ) : (
        <ActivePage
          key={`${selectedWorkspace.workspaceId}:${activeRoute}`}
          metricsState={activeRoute === "metrics" ? metricsOverviewState : undefined}
          onNavigate={handleNavigate}
          reportsState={activeRoute === "reports" ? reportsReaderState : undefined}
        />
      )}
    </AppShellLayout>
  );
}
