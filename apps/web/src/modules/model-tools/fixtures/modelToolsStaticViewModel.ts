import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, warningStatus, warningRisk } from "../../../shared/view-model/staticStateFixtures";
import type { ModelToolsViewModel } from "../models/modelToolsViewModel";

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
  gapNote:
    "Tool permission summary、runtime observation summary、RagStrategy detail 为 Gap；不定义 ToolCallCard / ModelCallCard 稳定结构。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:12:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.modelTools.section.modelToolsTabs.description",
      key: "model-tools-tabs",
      status: readyStatus,
      titleKey: "page.modelTools.section.modelToolsTabs.title"
    },
    {
      descriptionKey: "page.modelTools.section.configDetail.description",
      key: "config-detail",
      status: readyStatus,
      titleKey: "page.modelTools.section.configDetail.title"
    },
    {
      descriptionKey: "page.modelTools.section.relatedEntrances.description",
      key: "related-entrances",
      status: readyStatus,
      titleKey: "page.modelTools.section.relatedEntrances.title"
    }
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
    {
      count: 1,
      key: "model-configs",
      labelKey: "page.modelTools.tab.modelConfigs.label",
      status: "ready"
    },
    {
      count: 1,
      key: "routing-policies",
      labelKey: "page.modelTools.tab.routingPolicies.label",
      status: "ready"
    },
    {
      count: 1,
      key: "prompt-versions",
      labelKey: "page.modelTools.tab.promptVersions.label",
      status: "ready"
    },
    {
      count: 1,
      key: "tool-definitions",
      labelKey: "page.modelTools.tab.toolDefinitions.label",
      status: "ready"
    },
    {
      count: 1,
      key: "rag-strategies",
      labelKey: "page.modelTools.tab.ragStrategies.label",
      status: "warning"
    }
  ],
  pageDescriptionKey: "page.modelTools.description",
  pageKey: "model-tools",
  pageTitleKey: "page.modelTools.title",
  permissionEntrances: [
    {
      intent: "navigation",
      key: "model-tools-governance",
      labelKey: "action.modelToolsGovernance.label",
      targetRoute: "governance"
    }
  ],
  permissionSummary: defaultPermissionSummary,
  permissionSummaryEntries: [
    {
      description: "权限摘要待确认 / Gap。",
      key: "permission-summary",
      label: "权限",
      status: warningStatus,
      value: "待确认 / Gap"
    }
  ],
  primaryAction: {
    intent: "navigation",
    key: "model-tools-open-governance",
    labelKey: "action.modelToolsOpenGovernance.label",
    targetRoute: "governance"
  },
  promptVersions: [promptVersion],
  ragStrategies: [ragStrategy],
  readonlyState: defaultReadonlyState,
  relatedDataKnowledgeEntrances: [
    {
      intent: "navigation",
      key: "model-tools-data-knowledge",
      labelKey: "action.modelToolsDataKnowledge.label",
      targetRoute: "data-knowledge"
    }
  ],
  rightAssistSummary: createRightAssistSummary(
    "model-tools-right-assist",
    "page.modelTools.rightAssist.title",
    "page.modelTools.rightAssist.description"
  ),
  routingPolicies: [routingPolicy],
  runtimeObservationEntrances: [
    {
      intent: "navigation",
      key: "model-tools-observability",
      labelKey: "action.modelToolsObservability.label",
      targetRoute: "observability"
    }
  ],
  secondaryActions: [
    {
      intent: "navigation",
      key: "model-tools-open-observability",
      labelKey: "action.modelToolsOpenObservability.label",
      targetRoute: "observability"
    }
  ],
  selectedModelConfig: modelConfig,
  selectedPromptVersion: promptVersion,
  selectedRagStrategy: ragStrategy,
  selectedRoutingPolicy: routingPolicy,
  selectedTab: "model-configs",
  selectedToolDefinition: toolDefinition,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "配置对象只读摘要。",
      key: "config-count",
      label: "配置项",
      status: readyStatus,
      value: "5"
    }
  ],
  toolDefinitions: [toolDefinition]
};
