import { createDashboardViewModel } from "../../../modules/dashboard/mappers/createDashboardViewModel";
import { runtimeMetricsFixtures } from "./runtimeMetrics";

const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
});

export const dashboardInspectorDraftFixture = {
  lastUpdatedAt: dashboardViewModel.lastUpdatedAt,
  root: dashboardViewModel.root
};
