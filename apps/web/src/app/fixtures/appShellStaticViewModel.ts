import type { AppShellNavigationGroupViewModel, AppShellStaticViewModel } from "../models";
import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage
} from "./staticStateFixtures";

const webNavigationGroups: AppShellNavigationGroupViewModel[] = [
  {
    items: [
      { key: "dashboard", labelKey: "nav.dashboard" },
      { key: "analysis", labelKey: "nav.analysis" },
      { key: "reports", labelKey: "nav.reports" }
    ],
    key: "default-analysis",
    labelKey: "nav.group.defaultAnalysis"
  },
  {
    items: [
      { key: "data-knowledge", labelKey: "nav.dataKnowledge" },
      { key: "metrics", labelKey: "nav.metrics" }
    ],
    key: "data-metrics",
    labelKey: "nav.group.dataMetrics"
  },
  {
    items: [
      { key: "model-tools", labelKey: "nav.modelTools" },
      { key: "observability", labelKey: "nav.observability" }
    ],
    key: "model-observe",
    labelKey: "nav.group.modelObserve"
  },
  {
    items: [
      { key: "governance", labelKey: "nav.governance", badgeTextKey: "nav.badge.risk" },
      { key: "evaluation", labelKey: "nav.evaluation" },
      { key: "feedback", labelKey: "nav.feedback" },
      { key: "memory", labelKey: "nav.memory" }
    ],
    key: "governance-quality",
    labelKey: "nav.group.governanceQuality"
  },
  {
    items: [
      { key: "platform-operations", labelKey: "nav.platformOperations" },
      { key: "settings", labelKey: "nav.settings" },
      { key: "workspace", labelKey: "nav.workspace" }
    ],
    key: "platform",
    labelKey: "nav.group.platform"
  }
];

/**
 * #67 只提供全局壳层静态 ViewModel 输入。
 * AppShell / Header / LeftNav / RightAssistPanel 组件本体和真实路由均不在这里实现。
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
  mobileNavigation: [
    { ...webNavigationGroups[0], key: "primary", labelKey: "nav.group.primary" },
    { ...webNavigationGroups[1], key: "work", labelKey: "nav.group.work" },
    { ...webNavigationGroups[2], key: "ai-platform", labelKey: "nav.group.aiPlatform" },
    { ...webNavigationGroups[3], key: "quality-control", labelKey: "nav.group.qualityControl" },
    webNavigationGroups[4]
  ],
  navigationGroups: webNavigationGroups,
  permissionSummary: defaultPermissionSummary,
  readonlyState: defaultReadonlyState,
  rightAssistPanel: createRightAssistSummary(
    "global-right-assist",
    "app.rightAssist.global.title",
    "app.rightAssist.global.description"
  ),
  shellState: defaultStateCoverage,
  themePreference: {
    key: "theme",
    labelKey: "theme",
    value: "light"
  },
  workspace: {
    businessDomainCount: 6,
    memberCount: 18,
    name: "North Star Workspace",
    workspaceId: "workspace-north-star"
  }
};
