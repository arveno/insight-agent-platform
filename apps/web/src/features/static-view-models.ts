export { appShellStaticViewModel } from "../app/fixtures/appShellStaticViewModel";
export type { AppShellStaticViewModel } from "../app/models/appShellViewModel";
export { analysisStaticViewModel } from "./agent-analysis/fixtures/analysisStaticViewModel";
export type { AnalysisViewModel } from "./agent-analysis/models/analysisViewModel";
export { dashboardStaticViewModel } from "./dashboard/fixtures/dashboardStaticViewModel";
export type { DashboardViewModel } from "./dashboard/models/dashboardViewModel";
export { dataKnowledgeStaticViewModel } from "./data-knowledge/fixtures/dataKnowledgeStaticViewModel";
export type { DataKnowledgeViewModel } from "./data-knowledge/models/dataKnowledgeViewModel";
export { evaluationStaticViewModel } from "./evaluation/fixtures/evaluationStaticViewModel";
export type { EvaluationViewModel } from "./evaluation/models/evaluationViewModel";
export { feedbackStaticViewModel } from "./feedback/fixtures/feedbackStaticViewModel";
export type { FeedbackViewModel } from "./feedback/models/feedbackViewModel";
export { governanceStaticViewModel } from "./governance/fixtures/governanceStaticViewModel";
export type { GovernanceViewModel } from "./governance/models/governanceViewModel";
export { memoryStaticViewModel } from "./memory/fixtures/memoryStaticViewModel";
export type { MemoryViewModel } from "./memory/models/memoryViewModel";
export { metricsStaticViewModel } from "./metrics/fixtures/metricsStaticViewModel";
export type { MetricsViewModel } from "./metrics/models/metricsViewModel";
export { modelToolsStaticViewModel } from "./model-tools/fixtures/modelToolsStaticViewModel";
export type { ModelToolsViewModel } from "./model-tools/models/modelToolsViewModel";
export { observabilityStaticViewModel } from "./observability/fixtures/observabilityStaticViewModel";
export type { ObservabilityViewModel } from "./observability/models/observabilityViewModel";
export { platformOperationsStaticViewModel } from "./platform-operations/fixtures/platformOperationsStaticViewModel";
export type { PlatformOperationsViewModel } from "./platform-operations/models/platformOperationsViewModel";
export { reportsStaticViewModel } from "./reports/fixtures/reportsStaticViewModel";
export type { ReportsViewModel } from "./reports/models/reportsViewModel";
export { settingsStaticViewModel } from "./settings/fixtures/settingsStaticViewModel";
export type { SettingsViewModel } from "./settings/models/settingsViewModel";
export { workspaceStaticViewModel } from "./workspace/fixtures/workspaceStaticViewModel";
export type { WorkspaceViewModel } from "./workspace/models/workspaceViewModel";

import { appShellStaticViewModel } from "../app/fixtures/appShellStaticViewModel";
import { analysisStaticViewModel } from "./agent-analysis/fixtures/analysisStaticViewModel";
import { dashboardStaticViewModel } from "./dashboard/fixtures/dashboardStaticViewModel";
import { dataKnowledgeStaticViewModel } from "./data-knowledge/fixtures/dataKnowledgeStaticViewModel";
import { evaluationStaticViewModel } from "./evaluation/fixtures/evaluationStaticViewModel";
import { feedbackStaticViewModel } from "./feedback/fixtures/feedbackStaticViewModel";
import { governanceStaticViewModel } from "./governance/fixtures/governanceStaticViewModel";
import { memoryStaticViewModel } from "./memory/fixtures/memoryStaticViewModel";
import { metricsStaticViewModel } from "./metrics/fixtures/metricsStaticViewModel";
import { modelToolsStaticViewModel } from "./model-tools/fixtures/modelToolsStaticViewModel";
import { observabilityStaticViewModel } from "./observability/fixtures/observabilityStaticViewModel";
import { platformOperationsStaticViewModel } from "./platform-operations/fixtures/platformOperationsStaticViewModel";
import { reportsStaticViewModel } from "./reports/fixtures/reportsStaticViewModel";
import { settingsStaticViewModel } from "./settings/fixtures/settingsStaticViewModel";
import { workspaceStaticViewModel } from "./workspace/fixtures/workspaceStaticViewModel";

/**
 * #67 聚合出口只同步导出静态 ViewModel。
 * 后续 #68 / #69 可消费这里的数据输入，但页面编排、路由和真实数据接入不在本文件实现。
 */
export const productionStaticViewModels = {
  analysis: analysisStaticViewModel,
  appShell: appShellStaticViewModel,
  dashboard: dashboardStaticViewModel,
  dataKnowledge: dataKnowledgeStaticViewModel,
  evaluation: evaluationStaticViewModel,
  feedback: feedbackStaticViewModel,
  governance: governanceStaticViewModel,
  memory: memoryStaticViewModel,
  metrics: metricsStaticViewModel,
  modelTools: modelToolsStaticViewModel,
  observability: observabilityStaticViewModel,
  platformOperations: platformOperationsStaticViewModel,
  reports: reportsStaticViewModel,
  settings: settingsStaticViewModel,
  workspace: workspaceStaticViewModel
} as const;
