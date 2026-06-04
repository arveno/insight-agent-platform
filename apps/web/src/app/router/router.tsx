import type { ComponentType } from "react";

import type {
  AppShellNavigationGroupViewModel,
  AppShellNavigationItemViewModel,
  StaticRouteKey
} from "../models";
import { appShellStaticViewModel } from "../fixtures";
import {
  AnalysisPage,
  DashboardPage,
  DataKnowledgePage,
  EvaluationPage,
  FeedbackPage,
  GovernancePage,
  MemoryPage,
  MetricsPage,
  ModelToolsPage,
  ObservabilityPage,
  PlatformOperationsPage,
  ReportsPage,
  SettingsPage,
  WorkspacePage
} from "../../pages";
import type { WebPageProps } from "../../pages/_shared";
import {
  AppIcon,
  type I18nMessageKey,
  type IconName,
  type NavigationGroup,
  type NavigationItem
} from "../../shared";

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
