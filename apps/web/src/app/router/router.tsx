import type { ComponentType } from "react";

import { AnalysisPage } from "../../modules/analysis/Page";
import { DashboardPage } from "../../modules/dashboard/Page";
import { DataKnowledgePage } from "../../modules/data-knowledge/Page";
import { EvaluationPage } from "../../modules/evaluation/Page";
import { FeedbackPage } from "../../modules/feedback/Page";
import { GovernancePage } from "../../modules/governance/Page";
import { MemoryPage } from "../../modules/memory/Page";
import { MetricsPage } from "../../modules/metrics/Page";
import { ModelToolsPage } from "../../modules/model-tools/Page";
import { ObservabilityPage } from "../../modules/observability/Page";
import { PlatformOperationsPage } from "../../modules/platform-operations/Page";
import { ReportsPage } from "../../modules/reports/Page";
import { SettingsPage } from "../../modules/settings/Page";
import { WorkspacePage } from "../../modules/workspace/Page";
import { AppIcon } from "../../shared/icons/AppIcon";
import type { IconName } from "../../shared/icons/iconTypes";
import type { I18nMessageKey } from "../../shared/i18n/messages";
import { appShellStaticViewModel } from "../shell/fixtures/appShellStaticViewModel";
import type { NavigationGroup, NavigationItem } from "../shell/LeftNav";
import type {
  AppShellNavigationGroupViewModel,
  AppShellNavigationItemViewModel
} from "../shell/models/appShellViewModel";
import type { StaticRouteKey } from "../shell/models/staticViewModelTypes";

import type { WebPageProps } from "./pageProps";

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
