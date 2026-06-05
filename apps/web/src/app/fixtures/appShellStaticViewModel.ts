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
    key: "primary-entries",
    kind: "primary",
    labelKey: "nav.group.primaryEntrances"
  },
  {
    items: [
      { key: "metrics", labelKey: "nav.metrics" },
      { key: "data-knowledge", labelKey: "nav.dataKnowledge" },
      { key: "model-tools", labelKey: "nav.modelTools" },
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

const inspectorByRoute: AppShellStaticViewModel["inspectorByRoute"] = {
  analysis: {
    descriptionKey: "shell.inspector.analysis.description",
    titleKey: "page.analysis.title"
  },
  dashboard: {
    descriptionKey: "shell.inspector.dashboard.description",
    titleKey: "page.dashboard.title"
  },
  "data-knowledge": {
    descriptionKey: "shell.inspector.dataKnowledge.description",
    titleKey: "page.dataKnowledge.title"
  },
  evaluation: {
    descriptionKey: "shell.inspector.evaluation.description",
    titleKey: "page.evaluation.title"
  },
  feedback: {
    descriptionKey: "shell.inspector.feedback.description",
    titleKey: "page.feedback.title"
  },
  governance: {
    descriptionKey: "shell.inspector.governance.description",
    titleKey: "page.governance.title"
  },
  memory: {
    descriptionKey: "shell.inspector.memory.description",
    titleKey: "page.memory.title"
  },
  metrics: {
    descriptionKey: "shell.inspector.metrics.description",
    titleKey: "page.metrics.title"
  },
  "model-tools": {
    descriptionKey: "shell.inspector.modelTools.description",
    titleKey: "page.modelTools.title"
  },
  observability: {
    descriptionKey: "shell.inspector.observability.description",
    titleKey: "page.observability.title"
  },
  "platform-operations": {
    descriptionKey: "shell.inspector.platformOperations.description",
    titleKey: "page.platformOperations.title"
  },
  reports: {
    descriptionKey: "shell.inspector.reports.description",
    titleKey: "page.reports.title"
  },
  settings: {
    descriptionKey: "shell.inspector.settings.description",
    titleKey: "page.settings.title"
  },
  workspace: {
    descriptionKey: "shell.inspector.workspace.description",
    titleKey: "page.workspace.title"
  }
};

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
  inspectorByRoute,
  localePreference: {
    key: "locale",
    labelKey: "language",
    value: "zh-CN"
  },
  mobileNavigation: webNavigationGroups,
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
    name: "Northstar Retail China",
    workspaceId: "workspace-northstar-retail-china"
  },
  workspaces
};
