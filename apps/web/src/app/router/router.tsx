import type { ComponentType } from "react";

import type { AppShellNavigationGroupViewModel, AppShellNavigationItemViewModel } from "../models/appShellViewModel";
import type { StaticRouteKey } from "../models/staticViewModelTypes";
import { appShellStaticViewModel } from "../fixtures/appShellStaticViewModel";
import { AnalysisPage } from "../../pages/analysis/Page";
import { DashboardPage } from "../../pages/dashboard/Page";
import { DataKnowledgePage } from "../../pages/data-knowledge/Page";
import { EvaluationPage } from "../../pages/evaluation/Page";
import { FeedbackPage } from "../../pages/feedback/Page";
import { GovernancePage } from "../../pages/governance/Page";
import { MemoryPage } from "../../pages/memory/Page";
import { MetricsPage } from "../../pages/metrics/Page";
import { ModelToolsPage } from "../../pages/model-tools/Page";
import { ObservabilityPage } from "../../pages/observability/Page";
import { PlatformOperationsPage } from "../../pages/platform-operations/Page";
import { ReportsPage } from "../../pages/reports/Page";
import { SettingsPage } from "../../pages/settings/Page";
import { WorkspacePage } from "../../pages/workspace/Page";
import type { WebPageProps } from "../../pages/_shared/types";
import { AppIcon } from "../../shared/icons/AppIcon";
import type { I18nMessageKey } from "../../shared/i18n/messages";
import type { IconName } from "../../shared/icons/iconTypes";
import type { NavigationGroup, NavigationItem } from "../../shared/layout/shell/LeftNav";

type Translate = (key: I18nMessageKey) => string;

const routeIconByRoute: Record<StaticRouteKey, IconName> = {
  analysis: "analysis",
  dashboard: "dashboard",
  "data-knowledge": "data",
  evaluation: "evaluation",
  feedback: "feedback",
  governance: "governance",
  memory: "memory",
  metrics: "metrics",
  "model-tools": "models",
  observability: "observability",
  "platform-operations": "operations",
  reports: "reports",
  settings: "settings",
  workspace: "workspace"
};

/**
 * #68 只建立静态 WebComposition 路由表。
 * 这里不接真实路由库、不新增 MobileComposition，也不创建真实业务数据链路。
 */
export const webCompositionRoutes: Record<StaticRouteKey, ComponentType<WebPageProps>> = {
  analysis: AnalysisPage,
  dashboard: DashboardPage,
  "data-knowledge": DataKnowledgePage,
  evaluation: EvaluationPage,
  feedback: FeedbackPage,
  governance: GovernancePage,
  memory: MemoryPage,
  metrics: MetricsPage,
  "model-tools": ModelToolsPage,
  observability: ObservabilityPage,
  "platform-operations": PlatformOperationsPage,
  reports: ReportsPage,
  settings: SettingsPage,
  workspace: WorkspacePage
};

function translateNavigationLabel(t: Translate, key: string): string {
  return t(key as I18nMessageKey);
}

function createNavigationItem(t: Translate, item: AppShellNavigationItemViewModel): NavigationItem {
  return {
    badge: item.badgeTextKey ? translateNavigationLabel(t, item.badgeTextKey) : undefined,
    disabled: item.disabled,
    icon: <AppIcon name={routeIconByRoute[item.key]} variant="glyph" />,
    key: item.key,
    label: translateNavigationLabel(t, item.labelKey)
  };
}

export function createNavigationGroups(
  t: Translate,
  groups: AppShellNavigationGroupViewModel[]
): NavigationGroup[] {
  return groups.map((group) => ({
    kind: group.kind,
    items: group.items.map((item) => createNavigationItem(t, item)),
    key: group.key,
    label: translateNavigationLabel(t, group.labelKey)
  }));
}

export function createPrimaryNavigation(t: Translate): NavigationItem[] {
  return createNavigationGroups(t, appShellStaticViewModel.navigationGroups).flatMap(
    (group) => group.items
  );
}
