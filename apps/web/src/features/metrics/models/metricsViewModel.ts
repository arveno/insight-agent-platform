import type {
  StaticActionViewModel,
  StaticEvidenceEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type MetricsViewModel = StaticPageViewModelBase & {
  analysisEntrances: StaticActionViewModel[];
  anomalyEntrances: StaticActionViewModel[];
  dashboardEntrances: StaticActionViewModel[];
  metricCatalog: StaticSummaryItemViewModel[];
  metricEvidenceEntrances: StaticEvidenceEntranceViewModel[];
  metricFormula: StaticSummaryItemViewModel;
  metricLineage: StaticSummaryItemViewModel[];
  metricThresholds: StaticSummaryItemViewModel[];
  metricsState: StaticPageStateViewModel;
  relatedDataFields: StaticSummaryItemViewModel[];
  selectedMetric: StaticSummaryItemViewModel;
};
