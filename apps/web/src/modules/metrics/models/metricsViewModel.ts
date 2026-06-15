import type {
  AnalysisTaskContextPack,
  InspectorTreeNode
} from "@insight-agent/contracts/generated/typescript";

import type { ContextTreeNodeDisplayMap } from "../../../shared/view-model/contextTreeNodeDisplay";
import type {
  SharedRiskViewModel,
  SharedStatusViewModel
} from "../../../shared/utils/viewModelState";
import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../shared/view-model/staticViewModelTypes";

export type MetricsWorkspaceBinding = {
  workspaceId: string;
  workspaceName: string;
};

export type MetricListItemViewModel = {
  key: string;
  metricId: string;
  metricName: string;
};

export type MetricStatusViewModel = SharedStatusViewModel;

export type MetricRiskViewModel = SharedRiskViewModel;

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
  analysisContextNodeDisplay: ContextTreeNodeDisplayMap;
  businessDomainLabel: string;
  contextNodes: InspectorTreeNode[];
  currentSnapshotSummary: string;
  currentSnapshotValue: string;
  formulaSummary: string;
  key: string;
  metricId: string;
  metricDefinition: string;
  metricName: string;
  ownerTeam: string;
  riskView: MetricRiskViewModel;
  snapshotCapturedAt: string;
  snapshotPeriodLabel: string;
  statusView: MetricStatusViewModel;
  thresholdSummary: string;
  trendLabel: string;
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
