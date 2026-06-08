import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";

import type { DashboardViewModel } from "../models/dashboardViewModel";

export type DashboardComponentProps = {
  onNavigate?: NavigateToRoute;
  viewModel: DashboardViewModel;
};

export type DashboardHeroProps = DashboardComponentProps & {
  onTimeRangeChange: (key: DashboardViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardViewModel["timeRange"]["selectedKey"];
};

export type DashboardStatCardProps = Pick<DashboardComponentProps, "onNavigate"> & {
  metric: DashboardViewModel["businessStatCards"][number];
};

export type DashboardRiskCardProps = Pick<DashboardComponentProps, "onNavigate"> & {
  isRiskSummary?: boolean;
  item: DashboardViewModel["anomalyCards"][number];
};

export type DashboardReportEvidencePanelProps = DashboardComponentProps & {
  panel: "evidence" | "reports";
};

export type DashboardQualityCardProps = Pick<DashboardComponentProps, "onNavigate"> & {
  item: DashboardViewModel["platformQualitySummary"][number];
};
