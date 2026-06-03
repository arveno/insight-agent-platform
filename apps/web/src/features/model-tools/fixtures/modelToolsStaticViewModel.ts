import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningStatus,
  warningRisk
} from "../../../app/fixtures";
import type { ModelToolsViewModel } from "../models";

const modelConfig = {
  description: "模型配置摘要，不展示 provider secret。",
  key: "model-config-default",
  label: "default-analysis-model",
  risk: warningRisk,
  status: readyStatus,
  value: "gpt-class"
};

const routingPolicy = {
  description: "路由策略只作为只读配置摘要。",
  key: "routing-policy-default",
  label: "standard-routing",
  status: readyStatus,
  value: "cost-aware"
};

const promptVersion = {
  description: "Prompt 版本摘要，不展示敏感 prompt 原文。",
  key: "prompt-version-analysis",
  label: "analysis-v3",
  status: readyStatus,
  value: "active"
};

const toolDefinition = {
  description: "工具定义摘要，不执行 Tool。",
  key: "tool-definition-metric",
  label: "metric.query",
  risk: warningRisk,
  status: readyStatus,
  value: "registered"
};

const ragStrategy = {
  description: "RAG 策略详情待确认 / Gap。",
  key: "rag-strategy-finance",
  label: "finance-knowledge",
  status: warningStatus,
  value: "待确认 / Gap"
};

export const modelToolsStaticViewModel: ModelToolsViewModel = {
  configDetail: {
    description: "统一配置详情展示模型，不包含 secret。",
    key: "config-detail",
    label: "配置详情",
    risk: warningRisk,
    status: readyStatus,
    value: "selected model config"
  },
  gapNote: "Tool permission summary、runtime observation summary、RagStrategy detail 为 Gap；不定义 ToolCallCard / ModelCallCard 稳定结构。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:12:00+08:00",
  mainSections: [
    { description: "模型配置、路由策略、Prompt、Tool、RAG Tabs。", key: "model-tools-tabs", status: readyStatus, title: "Config Tabs" },
    { description: "配置详情 Drawer 输入和权限摘要。", key: "config-detail", status: readyStatus, title: "Config Detail" },
    { description: "Governance、Observability、Data & Knowledge 入口。", key: "related-entrances", status: readyStatus, title: "Related Entrances" }
  ],
  metricCards: [
    {
      evidenceCount: 0,
      key: "model-config-health",
      label: "配置健康度",
      risk: warningRisk,
      status: readyStatus,
      valueText: "只读摘要"
    }
  ],
  modelConfigs: [modelConfig],
  modelToolsState: defaultStateCoverage.ready,
  modelToolsTabs: [
    { count: 1, key: "model-configs", label: "ModelConfig", status: "ready" },
    { count: 1, key: "routing-policies", label: "RoutingPolicy", status: "ready" },
    { count: 1, key: "prompt-versions", label: "PromptVersion", status: "ready" },
    { count: 1, key: "tool-definitions", label: "ToolDefinition", status: "ready" },
    { count: 1, key: "rag-strategies", label: "RagStrategy", status: "warning" }
  ],
  pageDescription: "模型、Prompt、Tool、RAG 策略和路由配置的静态只读数据。",
  pageKey: "model-tools",
  pageTitle: "Models & Tools",
  permissionEntrances: [
    { intent: "navigation", key: "model-tools-governance", label: "查看权限治理", targetRoute: "governance" }
  ],
  permissionSummary: defaultPermissionSummary,
  permissionSummaryEntries: [
    { description: "权限摘要待确认 / Gap。", key: "permission-summary", label: "权限", status: warningStatus, value: "待确认 / Gap" }
  ],
  primaryAction: {
    intent: "navigation",
    key: "model-tools-open-governance",
    label: "查看治理",
    targetRoute: "governance"
  },
  promptVersions: [promptVersion],
  ragStrategies: [ragStrategy],
  readonlyState: defaultReadonlyState,
  relatedDataKnowledgeEntrances: [
    { intent: "navigation", key: "model-tools-data-knowledge", label: "查看知识上下文", targetRoute: "data-knowledge" }
  ],
  rightAssistSummary: createRightAssistSummary(
    "model-tools-right-assist",
    "Models & Tools 辅助摘要",
    "承接 selected config、permission summary、runtime observation 和相关数据知识入口。"
  ),
  routingPolicies: [routingPolicy],
  runtimeObservationEntrances: [
    { intent: "navigation", key: "model-tools-observability", label: "查看运行观测", targetRoute: "observability" }
  ],
  secondaryActions: [
    { intent: "navigation", key: "model-tools-open-observability", label: "查看观测", targetRoute: "observability" }
  ],
  selectedModelConfig: modelConfig,
  selectedPromptVersion: promptVersion,
  selectedRagStrategy: ragStrategy,
  selectedRoutingPolicy: routingPolicy,
  selectedTab: "model-configs",
  selectedToolDefinition: toolDefinition,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "配置对象只读摘要。", key: "config-count", label: "配置项", status: readyStatus, value: "5" }
  ],
  toolDefinitions: [toolDefinition]
};
