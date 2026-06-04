import { useMemo, useState } from "react";
import { Space, Typography } from "antd";

import { appShellStaticViewModel } from "../fixtures";
import type { StaticPageViewModelBase, StaticRouteKey } from "../models";
import { createNavigationGroups, webCompositionRoutes } from "../router/router";
import { useAppTheme } from "../theme";
import {
  analysisStaticViewModel,
  dashboardStaticViewModel,
  dataKnowledgeStaticViewModel,
  evaluationStaticViewModel,
  feedbackStaticViewModel,
  governanceStaticViewModel,
  memoryStaticViewModel,
  metricsStaticViewModel,
  modelToolsStaticViewModel,
  observabilityStaticViewModel,
  platformOperationsStaticViewModel,
  reportsStaticViewModel,
  settingsStaticViewModel,
  workspaceStaticViewModel
} from "../../features/static-view-models";
import { AppIcon, AppShellLayout, HeaderBar, LeftNav, StatusTag, useI18n } from "../../shared";
import { ActionBar, RightAssistSummaryPanel, toStatusTag, translateKey } from "../../pages/_shared";

const pageViewModels: Record<StaticRouteKey, StaticPageViewModelBase> = {
  analysis: analysisStaticViewModel,
  dashboard: dashboardStaticViewModel,
  "data-knowledge": dataKnowledgeStaticViewModel,
  evaluation: evaluationStaticViewModel,
  feedback: feedbackStaticViewModel,
  governance: governanceStaticViewModel,
  memory: memoryStaticViewModel,
  metrics: metricsStaticViewModel,
  "model-tools": modelToolsStaticViewModel,
  observability: observabilityStaticViewModel,
  "platform-operations": platformOperationsStaticViewModel,
  reports: reportsStaticViewModel,
  settings: settingsStaticViewModel,
  workspace: workspaceStaticViewModel
};

export function AppShell() {
  const { locale, t } = useI18n();
  const { themeMode } = useAppTheme();
  const [activeRoute, setActiveRoute] = useState<StaticRouteKey>(
    appShellStaticViewModel.currentRoute
  );
  const ActivePage = webCompositionRoutes[activeRoute];
  const activeViewModel = pageViewModels[activeRoute];
  const themeModeLabel = t(themeMode === "dark" ? "themeMode.dark" : "themeMode.light");
  const navigationGroups = useMemo(
    () => createNavigationGroups(t, appShellStaticViewModel.navigationGroups),
    [t]
  );
  const headerActions = (
    <Space size={16} wrap>
      <ActionBar
        actions={appShellStaticViewModel.headerActions}
        onNavigate={setActiveRoute}
        t={t}
      />
      <Typography.Text type="secondary">
        <AppIcon name="language" title={t("language")} />
        {translateKey(t, appShellStaticViewModel.localePreference.labelKey)}: {locale}
      </Typography.Text>
      <Typography.Text type="secondary">
        <AppIcon name="theme" title={t("theme")} />
        {translateKey(t, appShellStaticViewModel.themePreference.labelKey)}: {themeModeLabel}
      </Typography.Text>
    </Space>
  );

  return (
    <AppShellLayout
      header={
        <HeaderBar
          actions={headerActions}
          context={
            <Space wrap>
              <Typography.Text>
                <AppIcon name="workspace" title={t("nav.workspace")} />
                {appShellStaticViewModel.workspace.name}
              </Typography.Text>
              <Typography.Text type="secondary">
                <AppIcon name="user" title={t("userMenu")} />
                {appShellStaticViewModel.currentUser.displayName}
              </Typography.Text>
            </Space>
          }
          status={
            <StatusTag
              {...toStatusTag(t, {
                labelKey: appShellStaticViewModel.shellState.ready.titleKey,
                status: appShellStaticViewModel.shellState.ready.kind
              })!}
            />
          }
          subtitle={translateKey(t, appShellStaticViewModel.environmentSummary.messageKey)}
          title={t("app.productTitle")}
        />
      }
      leftNav={
        <Space direction="vertical" size={12} style={{ paddingBlock: 20, width: "100%" }}>
          <Typography.Text strong style={{ paddingInline: 24 }}>
            <AppIcon name="dashboard" title={t("appName")} />
            {t("appName")}
          </Typography.Text>
          <LeftNav
            groups={navigationGroups}
            onSelect={(key) => setActiveRoute(key as StaticRouteKey)}
            selectedKey={activeRoute}
          />
        </Space>
      }
      rightAssistPanel={
        <RightAssistSummaryPanel
          onNavigate={setActiveRoute}
          summary={activeViewModel.rightAssistSummary}
        />
      }
    >
      <ActivePage onNavigate={setActiveRoute} />
    </AppShellLayout>
  );
}
