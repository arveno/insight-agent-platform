import type {
  AppShellNavigationGroupViewModel,
  AppShellStaticViewModel
} from "../models/appShellViewModel";
import {
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage
} from "../../../shared/view-model/staticStateFixtures";

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

const workspaces = [
  {
    name: "Northstar Retail China",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    name: "East Retail Demo",
    workspaceId: "workspace-east-retail-demo"
  },
  {
    name: "Global Ops Sandbox",
    workspaceId: "workspace-global-ops-sandbox"
  }
];

/**
 * #67 只提供全局壳层静态 ViewModel 输入。
 * AppShell / Header / LeftNav / SidePanel 组件本体和真实路由均不在这里实现。
 */
export const appShellStaticViewModel: AppShellStaticViewModel = {
  currentRoute: "dashboard",
  currentUser: {
    displayName: "Ada Chen",
    roleLabel: "经营分析负责人",
    userId: "user-ada"
  },
  environmentSummary: {
    labelKey: "app.environment.summary.label",
    messageKey: "app.environment.summary.message"
  },
  globalFeedback: {
    messageKey: "app.globalFeedback.idle.message",
    status: "idle"
  },
  headerActions: [
    {
      intent: "navigation",
      key: "open-settings",
      labelKey: "settings",
      targetRoute: "settings"
    },
    {
      intent: "secondary",
      key: "language",
      labelKey: "language"
    },
    {
      intent: "secondary",
      key: "theme",
      labelKey: "theme"
    }
  ],
  localePreference: {
    key: "locale",
    labelKey: "language",
    value: "zh-CN"
  },
  mobileNavigation: webNavigationGroups,
  navigationGroups: webNavigationGroups,
  permissionSummary: defaultPermissionSummary,
  readonlyState: defaultReadonlyState,
  shellState: defaultStateCoverage,
  themePreference: {
    key: "theme",
    labelKey: "theme",
    value: "light"
  },
  workspace: {
    businessDomainCount: 6,
    memberCount: 18,
    name: "Northstar Retail China",
    workspaceId: "workspace-northstar-retail-china"
  },
  workspaces
};
