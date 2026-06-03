import type { AppShellNavigationGroupViewModel, AppShellStaticViewModel } from "../models";
import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage } from "./staticStateFixtures";

const webNavigationGroups: AppShellNavigationGroupViewModel[] = [
  {
    items: [
      { key: "dashboard", label: "Dashboard" },
      { key: "analysis", label: "Analysis" },
      { key: "reports", label: "Reports" }
    ],
    key: "default-analysis",
    label: "Default & Analysis"
  },
  {
    items: [
      { key: "data-knowledge", label: "Data & Knowledge" },
      { key: "metrics", label: "Metrics" }
    ],
    key: "data-metrics",
    label: "Data & Metrics"
  },
  {
    items: [
      { key: "model-tools", label: "Models & Tools" },
      { key: "observability", label: "Observability" }
    ],
    key: "model-observe",
    label: "Model & Observe"
  },
  {
    items: [
      { key: "governance", label: "Governance", badgeText: "Risk" },
      { key: "evaluation", label: "Evaluation" },
      { key: "feedback", label: "Feedback" },
      { key: "memory", label: "Memory" }
    ],
    key: "governance-quality",
    label: "Governance & Quality"
  },
  {
    items: [
      { key: "platform-operations", label: "Platform Operations" },
      { key: "settings", label: "Settings" },
      { key: "workspace", label: "Workspace" }
    ],
    key: "platform",
    label: "Platform"
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
    label: "Production UI Shell",
    message: "静态 ViewModel 数据层，不接真实环境配置或密钥。"
  },
  globalFeedback: {
    message: "全局反馈入口已预留为静态 UI State。",
    status: "idle"
  },
  headerActions: [
    {
      intent: "navigation",
      key: "open-settings",
      label: "Settings",
      targetRoute: "settings"
    },
    {
      intent: "secondary",
      key: "language",
      label: "Language: zh-CN"
    },
    {
      intent: "secondary",
      key: "theme",
      label: "Theme: Light"
    }
  ],
  localePreference: {
    key: "locale",
    label: "Locale",
    value: "zh-CN"
  },
  mobileNavigation: [
    { ...webNavigationGroups[0], key: "primary", label: "Primary" },
    { ...webNavigationGroups[1], key: "work", label: "Work" },
    { ...webNavigationGroups[2], key: "ai-platform", label: "AI Platform" },
    { ...webNavigationGroups[3], key: "quality-control", label: "Quality & Control" },
    webNavigationGroups[4]
  ],
  navigationGroups: webNavigationGroups,
  permissionSummary: defaultPermissionSummary,
  readonlyState: defaultReadonlyState,
  rightAssistPanel: createRightAssistSummary(
    "global-right-assist",
    "全局辅助面板摘要",
    "承接页面传入的 Evidence、Trace、Report、Audit、Job、Risk 和 Decision 摘要。"
  ),
  shellState: defaultStateCoverage,
  themePreference: {
    key: "theme",
    label: "Theme",
    value: "light"
  },
  workspace: {
    businessDomainCount: 6,
    memberCount: 18,
    name: "North Star Workspace",
    workspaceId: "workspace-north-star"
  }
};
