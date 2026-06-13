import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase
} from "../../../shared/view-model/staticViewModelTypes";

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

export type DashboardSurfaceViewModel = StaticPageViewModelBase & {
  dashboardId: string;
  dashboardState: StaticPageStateViewModel;
  description: string;
  root: InspectorTreeNode;
  timeRange: DashboardTimeRangeViewModel;
  title: string;
};
