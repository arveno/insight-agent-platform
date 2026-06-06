import type { StaticRouteKey } from "../../app/models";
import type { DataKnowledgeOverviewController } from "../../features/data-knowledge/hooks";
import type { MetricsOverviewController } from "../../features/metrics/hooks";
import type { PlatformOperationsOverviewController } from "../../features/platform-operations/hooks";
import type { ReportsReaderController } from "../../features/reports/hooks";

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type WebPageProps = {
  dataKnowledgeState?: DataKnowledgeOverviewController;
  metricsState?: MetricsOverviewController;
  onNavigate?: NavigateToRoute;
  platformOperationsState?: PlatformOperationsOverviewController;
  reportsState?: ReportsReaderController;
};
