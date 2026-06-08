import type { StaticActionViewModel, StaticEvidenceEntranceViewModel, StaticPageStateViewModel, StaticPageViewModelBase, StaticReportEntranceViewModel, StaticSummaryItemViewModel } from "../../../shared/view-model/staticViewModelTypes";

export type DashboardTimeRangeKey =
  | "last_12_hours"
  | "last_7_days"
  | "last_30_days"
  | "this_quarter";

export type DashboardTimeRangeOptionViewModel = {
  description: string;
  key: DashboardTimeRangeKey;
  label: string;
};

export type DashboardTimeRangeViewModel = {
  options: DashboardTimeRangeOptionViewModel[];
  selectedKey: DashboardTimeRangeKey;
};

export type DashboardViewModel = StaticPageViewModelBase & {
  analysisEntrances: StaticActionViewModel[];
  anomalyCards: StaticSummaryItemViewModel[];
  businessStatCards: StaticPageViewModelBase["metricCards"];
  dashboardState: StaticPageStateViewModel;
  dashboardSummary: StaticSummaryItemViewModel[];
  evidenceEntrances: StaticEvidenceEntranceViewModel[];
  platformQualitySummary: StaticSummaryItemViewModel[];
  recentReports: StaticReportEntranceViewModel[];
  riskSummary: StaticSummaryItemViewModel[];
  timeRange: DashboardTimeRangeViewModel;
};
