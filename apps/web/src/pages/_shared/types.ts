import type { StaticRouteKey } from "../../app/models";
import type { ReportsReaderController } from "../../features/reports/hooks";

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type WebPageProps = {
  onNavigate?: NavigateToRoute;
  reportsState?: ReportsReaderController;
};
