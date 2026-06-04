import type { DashboardViewModel } from "../../../features/static-view-models";
import type { NavigateToRoute } from "../../_shared";

export type DashboardComponentProps = {
  onNavigate?: NavigateToRoute;
  viewModel: DashboardViewModel;
};
