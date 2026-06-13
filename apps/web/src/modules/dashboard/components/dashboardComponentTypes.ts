import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import type { DashboardSurfaceViewModel } from "../models/dashboardViewModel";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

type DashboardNavigationProps = {
  onNavigate?: NavigateToRoute;
};

export type DashboardHeroProps = DashboardNavigationProps & {
  onTimeRangeChange: (key: DashboardSurfaceViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardSurfaceViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardSurfaceViewModel["timeRange"]["selectedKey"];
  viewModel: DashboardSurfaceViewModel;
};

export type DashboardStatCardProps = DashboardNavigationProps & {
  metric: InspectorTreeNode;
  timeRange: DashboardSurfaceViewModel["timeRange"]["options"][number];
  viewModel: DashboardSurfaceViewModel;
};

export type DashboardRiskCardProps = DashboardNavigationProps & {
  isRiskSummary?: boolean;
  item: InspectorTreeNode;
  viewModel: DashboardSurfaceViewModel;
};

export type DashboardReportEvidenceCardProps =
  | (DashboardNavigationProps & {
      kind: "report";
      report: InspectorTreeNode;
      viewModel: DashboardSurfaceViewModel;
    })
  | (DashboardNavigationProps & {
      evidence: InspectorTreeNode;
      kind: "evidence";
      viewModel: DashboardSurfaceViewModel;
    });

export type DashboardQualityCardProps = DashboardNavigationProps & {
  item: InspectorTreeNode;
  viewModel: DashboardSurfaceViewModel;
};
