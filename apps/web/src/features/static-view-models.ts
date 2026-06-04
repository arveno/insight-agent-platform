export { appShellStaticViewModel } from "../app/fixtures";
export type { AppShellStaticViewModel } from "../app/models";
export { analysisStaticViewModel } from "./agent-analysis/fixtures";
export type { AnalysisViewModel } from "./agent-analysis/models";
export { dashboardStaticViewModel } from "./dashboard/fixtures";
export type { DashboardViewModel } from "./dashboard/models";
export { dataKnowledgeStaticViewModel } from "./data-knowledge/fixtures";
export type { DataKnowledgeViewModel } from "./data-knowledge/models";
export { evaluationStaticViewModel } from "./evaluation/fixtures";
export type { EvaluationViewModel } from "./evaluation/models";
export { feedbackStaticViewModel } from "./feedback/fixtures";
export type { FeedbackViewModel } from "./feedback/models";
export { governanceStaticViewModel } from "./governance/fixtures";
export type { GovernanceViewModel } from "./governance/models";
export { memoryStaticViewModel } from "./memory/fixtures";
export type { MemoryViewModel } from "./memory/models";
export { metricsStaticViewModel } from "./metrics/fixtures";
export type { MetricsViewModel } from "./metrics/models";
export { modelToolsStaticViewModel } from "./model-tools/fixtures";
export type { ModelToolsViewModel } from "./model-tools/models";
export { observabilityStaticViewModel } from "./observability/fixtures";
export type { ObservabilityViewModel } from "./observability/models";
export { platformOperationsStaticViewModel } from "./platform-operations/fixtures";
export type { PlatformOperationsViewModel } from "./platform-operations/models";
export { reportsStaticViewModel } from "./reports/fixtures";
export type { ReportsViewModel } from "./reports/models";
export { settingsStaticViewModel } from "./settings/fixtures";
export type { SettingsViewModel } from "./settings/models";
export { workspaceStaticViewModel } from "./workspace/fixtures";
export type { WorkspaceViewModel } from "./workspace/models";

import { appShellStaticViewModel } from "../app/fixtures";
import { analysisStaticViewModel } from "./agent-analysis/fixtures";
import { dashboardStaticViewModel } from "./dashboard/fixtures";
import { dataKnowledgeStaticViewModel } from "./data-knowledge/fixtures";
import { evaluationStaticViewModel } from "./evaluation/fixtures";
import { feedbackStaticViewModel } from "./feedback/fixtures";
import { governanceStaticViewModel } from "./governance/fixtures";
import { memoryStaticViewModel } from "./memory/fixtures";
import { metricsStaticViewModel } from "./metrics/fixtures";
import { modelToolsStaticViewModel } from "./model-tools/fixtures";
import { observabilityStaticViewModel } from "./observability/fixtures";
import { platformOperationsStaticViewModel } from "./platform-operations/fixtures";
import { reportsStaticViewModel } from "./reports/fixtures";
import { settingsStaticViewModel } from "./settings/fixtures";
import { workspaceStaticViewModel } from "./workspace/fixtures";

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
