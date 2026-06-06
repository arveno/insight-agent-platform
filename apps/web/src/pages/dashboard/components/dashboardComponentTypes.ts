import type { DashboardViewModel } from "../../../features/static-view-models";
import type { NavigateToRoute } from "../../_shared/types";

export type DashboardComponentProps = {
  onNavigate?: NavigateToRoute;
  viewModel: DashboardViewModel;
};

export type DashboardHeroProps = DashboardComponentProps & {
  onTimeRangeChange: (key: DashboardViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardViewModel["timeRange"]["selectedKey"];
};

export type DashboardMetricCardProps = Pick<DashboardComponentProps, "onNavigate"> & {
  metric: DashboardViewModel["businessMetricCards"][number];
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
