import type {
  StaticEvidenceEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../app/models";

export type MetricsWorkspaceBinding = {
  workspaceId: string;
  workspaceName: string;
};

export type MetricListItemViewModel = {
  key: string;
  metricId: string;
  metricName: string;
};

export type MetricThresholdRuleViewModel = {
  condition: string;
  key: string;
  label: string;
  risk?: StaticRiskViewModel;
};

export type MetricLineageSourceViewModel = {
  description: string;
  key: string;
  label: string;
  source: string;
};

export type MetricAnalysisContextViewModel = {
  currentValue: string;
  evidenceRefs: string[];
  formula: string;
  lineage: string;
  metricId: string;
  metricName: string;
  riskLevel: string;
  threshold: string;
  timeRange: string;
  trend: string;
  workspaceId: string;
};

export type MetricDetailViewModel = {
  analysisContext: MetricAnalysisContextViewModel;
  businessDomain: string;
  currentValue: string;
  definition: string;
  evidenceItems: StaticEvidenceEntranceViewModel[];
  formula: {
    businessFormula: string;
    technicalFormula: string;
  };
  key: string;
  lineageSources: MetricLineageSourceViewModel[];
  metricId: string;
  metricName: string;
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  thresholdRules: MetricThresholdRuleViewModel[];
  timeRange: string;
  trend: string;
  workspaceId: string;
};

export type MetricsViewModel = StaticPageViewModelBase & {
  metrics: MetricListItemViewModel[];
  metricsState: StaticPageStateViewModel;
  readonlyNotice: string;
  selectedMetric: MetricDetailViewModel;
  workspaceNotice: string;
};
