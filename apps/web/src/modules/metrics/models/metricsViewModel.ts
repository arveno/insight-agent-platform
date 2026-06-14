import type {
  StaticSummaryItemViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
} from "../../../shared/view-model/staticViewModelTypes";
import type { AnalysisTaskContextPack } from "@insight-agent/contracts/generated/typescript";

export type MetricsWorkspaceBinding = {
  workspaceId: string;
  workspaceName: string;
};

export type MetricListItemViewModel = {
  key: string;
  metricId: string;
  metricName: string;
};

export type MetricContextSourceViewModel = {
  key: string;
  meta: string;
  description: string;
  title: string;
};

export type MetricStatusViewModel = {
  label: string;
  tone: "default" | "processing" | "success" | "warning" | "error";
};

export type MetricRiskViewModel = {
  label: string;
  level: "low" | "medium" | "high" | "critical" | "unknown";
};

export type MetricSummaryDistributionItemViewModel = {
  key: string;
  label: string;
  value: string;
};

export type MetricTimeRangeOptionViewModel = {
  disabled?: boolean;
  key: string;
  label: string;
};

export type MetricAtRiskItemViewModel = {
  currentValue: string;
  key: string;
  metricId: string;
  metricName: string;
  riskView: MetricRiskViewModel;
  statusView: MetricStatusViewModel;
  thresholdSummary: string;
};

export type MetricDetailViewModel = {
  analysisContextPack: AnalysisTaskContextPack;
  businessDomainId: string;
  businessDomainLabel: string;
  contextSources: MetricContextSourceViewModel[];
  currentValue: string;
  definition: string;
  formulaSummary: string;
  key: string;
  metricId: string;
  metricName: string;
  ownerTeam: string;
  period: string;
  riskLevel: string;
  riskView: MetricRiskViewModel;
  status: string;
  statusView: MetricStatusViewModel;
  thresholdSummary: string;
  trendLabel: string;
  updatedAt: string;
  workspaceId: string;
};

export type MetricsInspectorViewModel = {
  atRiskMetrics: MetricAtRiskItemViewModel[];
  businessDomainDistribution: MetricSummaryDistributionItemViewModel[];
  contextSourceTypeDistribution: MetricSummaryDistributionItemViewModel[];
  readonlyBoundaryItems: string[];
  riskDistribution: MetricSummaryDistributionItemViewModel[];
  selectedTimeRangeKey: string;
  timeRangeOptions: MetricTimeRangeOptionViewModel[];
  workspaceSummaryItems: StaticSummaryItemViewModel[];
};

export type MetricsViewModel = StaticPageViewModelBase & {
  inspector: MetricsInspectorViewModel;
  metrics: MetricListItemViewModel[];
  metricsState: StaticPageStateViewModel;
  readonlyNotice: string;
  selectedMetric: MetricDetailViewModel;
  workspaceNotice: string;
};
