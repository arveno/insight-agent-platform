import type { StaticRouteKey } from "../../app/models";
import type { MetricsOverviewController } from "../../features/metrics/hooks";
import type { ReportsReaderController } from "../../features/reports/hooks";

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type WebPageProps = {
  metricsState?: MetricsOverviewController;
  onNavigate?: NavigateToRoute;
  reportsState?: ReportsReaderController;
};
