import type {
  AnalysisTaskContextPack,
  InspectorTreeNode
} from "@insight-agent/contracts/generated/typescript";

import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase
} from "../../../shared/view-model/staticViewModelTypes";
import type { RiskBadgeProps } from "../../../shared/ui/status/RiskBadge";
import type { StatusTagProps } from "../../../shared/ui/status/StatusTag";

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

export type DashboardNodeDisplayViewModel = {
  defaultInspectorSelection?: boolean;
  risk?: RiskBadgeProps;
  sourceRefId?: string;
  status?: StatusTagProps;
  trendText?: string;
  valueText?: string;
};

export type DashboardSurfaceViewModel = StaticPageViewModelBase & {
  dashboardId: string;
  dashboardState: StaticPageStateViewModel;
  description: string;
  metricContextPacks: Record<string, AnalysisTaskContextPack>;
  nodeDisplay: Record<string, DashboardNodeDisplayViewModel>;
  root: InspectorTreeNode;
  timeRange: DashboardTimeRangeViewModel;
  title: string;
};
