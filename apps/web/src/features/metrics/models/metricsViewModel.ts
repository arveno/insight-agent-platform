import type {
  StaticEvidenceEntranceViewModel,
  StaticMetricCardViewModel,
  StaticActionViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type MetricsDetailCardViewModel = {
  description: string;
  eyebrow?: string;
  key: string;
  meta?: string;
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  title: string;
  value?: string;
};

export type MetricsAnalysisContextViewModel = {
  currentValue: string;
  evidenceRefs: string[];
  formula: string;
  key: string;
  lineage: string;
  metricId: string;
  metricName: string;
  riskLevel: string;
  threshold: string;
  timeRange: string;
  trend: string;
  workspaceId: string;
};

export type MetricsViewModel = StaticPageViewModelBase & {
  dashboardEntrances: StaticActionViewModel[];
  evidenceEntrances: StaticEvidenceEntranceViewModel[];
  formulaThresholdCards: MetricsDetailCardViewModel[];
  lineageSourceCards: MetricsDetailCardViewModel[];
  metricCatalogCards: StaticMetricCardViewModel[];
  metricContexts: MetricsAnalysisContextViewModel[];
  metricDirectory: StaticSummaryItemViewModel[];
  metricsState: StaticPageStateViewModel;
  readonlyNotice: string;
  trendAnomalyCards: StaticMetricCardViewModel[];
  workspaceNotice: string;
};
