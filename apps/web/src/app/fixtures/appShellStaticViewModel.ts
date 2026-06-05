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

const inspectorByRoute: AppShellStaticViewModel["inspectorByRoute"] = {
  analysis: {
    capabilityNotes: [
      "用于承接分析会话、追问和问题定位。",
      "后续会对接 Agent Run、Tool Calling、Run Trace、RAG Evidence。",
      "关联能力：Agent Runtime、Tools、RAG、Observability。"
    ],
    summary: "当前阶段只保留分析页壳层说明区，用于明确后续分析链路的主要承接面。",
    titleKey: "page.analysis.title"
  },
  dashboard: {
    capabilityNotes: [
      "用于查看当前工作区经营概览、异常摘要和关键入口。",
      "后续承接指标汇总、异常提醒、报告入口和分析入口。",
      "关联能力：Metrics、Reports、Analysis、Observability。"
    ],
    summary: "当前阶段只保留仪表盘说明区，用于标注首页后续会聚合的能力范围。",
    titleKey: "page.dashboard.title"
  },
  "data-knowledge": {
    capabilityNotes: [
      "用于管理数据源、知识资产和可引用材料。",
      "后续会对接 RAG、数据源 Schema、知识检索和证据链。",
      "关联能力：RAG、Source Lineage、Evidence。"
    ],
    summary: "当前阶段只保留数据与知识说明区，用于定义后续知识与数据链路的边界。",
    titleKey: "page.dataKnowledge.title"
  },
  evaluation: {
    capabilityNotes: [
      "用于评估模型输出、工具调用质量和任务效果。",
      "后续会对接评分集、评测任务、Bad Case 分析。",
      "关联能力：Evaluation Dataset、Scoring、Regression。"
    ],
    summary: "当前阶段只保留评估说明区，用于说明后续评测与回归体系的承接点。",
    titleKey: "page.evaluation.title"
  },
  feedback: {
    capabilityNotes: [
      "用于承接人工反馈、采纳状态和结果纠偏。",
      "后续会对接 Bad Case、人工标注、模型改进闭环。",
      "关联能力：Feedback Loop、Evaluation、Bad Case。"
    ],
    summary: "当前阶段只保留反馈说明区，用于标注人工反馈和纠偏闭环的未来入口。",
    titleKey: "page.feedback.title"
  },
  governance: {
    capabilityNotes: [
      "用于承接权限、风险策略、审计和 Guardrail。",
      "后续会对接权限边界、工具白名单、操作审计。",
      "关联能力：Guardrail、Audit、Policy。"
    ],
    summary: "当前阶段只保留治理说明区，用于说明策略、审计和权限边界的后续承载位。",
    titleKey: "page.governance.title"
  },
  memory: {
    capabilityNotes: [
      "用于展示长期记忆、上下文沉淀和可复用偏好。",
      "后续会对接 Memory Store、Context Policy。",
      "关联能力：Memory、Context Engineering。"
    ],
    summary: "当前阶段只保留记忆说明区，用于说明长期记忆与上下文工程的未来承接方向。",
    titleKey: "page.memory.title"
  },
  metrics: {
    capabilityNotes: [
      "用于定义指标口径、阈值、异常规则和血缘。",
      "后续会对接数据源、指标计算、异常检测。",
      "关联能力：Data & Knowledge、Observability、Governance。"
    ],
    summary: "当前阶段只保留指标说明区，用于标记指标治理与异常检测的未来入口。",
    titleKey: "page.metrics.title"
  },
  "model-tools": {
    capabilityNotes: [
      "用于配置模型、Prompt、工具和工具调用策略。",
      "后续会对接 Model Gateway、Tool Registry、Prompt Template。",
      "关联能力：Model Gateway、Tool Calling、Planner。"
    ],
    summary: "当前阶段只保留模型与工具说明区，用于明确模型网关和工具注册链路的入口。",
    titleKey: "page.modelTools.title"
  },
  observability: {
    capabilityNotes: [
      "用于查看运行轨迹、延迟、成本、错误和调用链。",
      "后续会对接 Run Trace、Token Cost、错误诊断和日志。",
      "关联能力：LangSmith-like Trace、Run Events、Cost Tracking。"
    ],
    summary: "当前阶段只保留观测说明区，用于标记运行追踪和成本可观测性的后续承接位。",
    titleKey: "page.observability.title"
  },
  "platform-operations": {
    capabilityNotes: [
      "用于平台运维、任务状态、通知和运行健康度。",
      "后续会对接任务队列、部署状态、运行告警。",
      "关联能力：Jobs、Notifications、Health Check。"
    ],
    summary: "当前阶段只保留平台运维说明区，用于说明任务与平台健康治理的未来入口。",
    titleKey: "page.platformOperations.title"
  },
  reports: {
    capabilityNotes: [
      "用于沉淀分析结果和报告资产。",
      "后续会对接报告生成、报告版本、证据引用和导出能力。",
      "关联能力：Report Generator、Evidence、RAG、Evaluation。"
    ],
    summary: "当前阶段只保留报告说明区，用于说明后续报告沉淀和证据引用的主要能力面。",
    titleKey: "page.reports.title"
  },
  settings: {
    capabilityNotes: [
      "用于承接环境配置、默认策略和用户偏好。",
      "后续会对接模型默认项、工作区配置和偏好设置。",
      "关联能力：Workspace Config、User Preferences。"
    ],
    summary: "当前阶段只保留设置说明区，用于说明平台默认项和偏好设置的后续承接位。",
    titleKey: "page.settings.title"
  },
  workspace: {
    capabilityNotes: [
      "用于承接工作区概况、成员范围和静态切换管理入口。",
      "后续会对接工作区权限、资源隔离和配置管理。",
      "关联能力：Workspace Config、Access Control、Governance。"
    ],
    summary: "当前阶段只保留工作区说明区，用于标记工作区管理和隔离能力的未来承接面。",
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
