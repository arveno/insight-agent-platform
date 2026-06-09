import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";

import type { DashboardViewModel } from "../models/dashboardViewModel";

type DashboardNavigationProps = {
  onNavigate?: NavigateToRoute;
};

export type DashboardHeroProps = DashboardNavigationProps & {
  onTimeRangeChange: (key: DashboardViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardViewModel["timeRange"]["selectedKey"];
  viewModel: DashboardViewModel;
};

export type DashboardStatCardProps = DashboardNavigationProps & {
  metric: DashboardViewModel["businessStatCards"][number];
};

export type DashboardRiskCardProps = DashboardNavigationProps & {
  isRiskSummary?: boolean;
  item: DashboardViewModel["anomalyCards"][number] | DashboardViewModel["riskSummary"][number];
};

export type DashboardReportEvidenceCardProps =
  | (DashboardNavigationProps & {
      kind: "report";
      report: DashboardViewModel["recentReports"][number];
    })
  | (DashboardNavigationProps & {
      evidence: DashboardViewModel["evidenceEntrances"][number];
      kind: "evidence";
    });

export type DashboardQualityCardProps = DashboardNavigationProps & {
  item: DashboardViewModel["platformQualitySummary"][number];
};
