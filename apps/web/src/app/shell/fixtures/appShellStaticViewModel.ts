import type { AppShellNavigationGroupViewModel } from "../models/appShellViewModel";
import type { StaticRouteKey } from "../../../shared/view-model/staticViewModelTypes";

const webNavigationGroups: AppShellNavigationGroupViewModel[] = [
  {
    items: [
      { key: "dashboard", labelKey: "nav.dashboard" },
      { key: "analysis", labelKey: "nav.analysis" },
      { key: "reports", labelKey: "nav.reports" }
    ],
    key: "primary-entries",
    kind: "primary",
    labelKey: "nav.group.primaryEntrances"
  },
  {
    items: [
      { key: "metrics", labelKey: "nav.metrics" },
      { key: "data-knowledge", labelKey: "nav.dataKnowledge" },
      { key: "model-tools", labelKey: "nav.modelTools" },
      { key: "observability", labelKey: "nav.observability" },
      { key: "governance", labelKey: "nav.governance", badgeTextKey: "nav.badge.risk" },
      { key: "feedback", labelKey: "nav.feedback" },
      { key: "evaluation", labelKey: "nav.evaluation" },
      { key: "memory", labelKey: "nav.memory" },
      { key: "platform-operations", labelKey: "nav.platformOperations" },
      { key: "settings", labelKey: "nav.settings" }
    ],
    key: "capability-preview",
    kind: "preview",
    labelKey: "nav.group.previewEntrances"
  }
];

type AppShellStaticConfig = {
  currentRoute: StaticRouteKey;
  mobileNavigation: AppShellNavigationGroupViewModel[];
  navigationGroups: AppShellNavigationGroupViewModel[];
  selectedBusinessDomainId: string;
};

/**
 * #67 只保留 AppShell 当前仍需要的静态导航配置。
 * 真实 user / workspace / membership 已迁移到 authenticated session。
 */
export const appShellStaticViewModel: AppShellStaticConfig = {
  currentRoute: "dashboard",
  mobileNavigation: webNavigationGroups,
  navigationGroups: webNavigationGroups,
  selectedBusinessDomainId: "business-domain-revenue-quality",
};
