import type {
  StaticActionViewModel,
  StaticEvidenceEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticReportEntranceViewModel,
  StaticSummaryItemViewModel
} from "../../../app/models";

export type DashboardViewModel = StaticPageViewModelBase & {
  analysisEntrances: StaticActionViewModel[];
  anomalyCards: StaticSummaryItemViewModel[];
  businessMetricCards: StaticPageViewModelBase["metricCards"];
  dashboardState: StaticPageStateViewModel;
  dashboardSummary: StaticSummaryItemViewModel[];
  evidenceEntrances: StaticEvidenceEntranceViewModel[];
  platformQualitySummary: StaticSummaryItemViewModel[];
  recentReports: StaticReportEntranceViewModel[];
  riskSummary: StaticSummaryItemViewModel[];
};
