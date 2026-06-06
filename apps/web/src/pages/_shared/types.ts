import type { StaticRouteKey } from "../../app/models/staticViewModelTypes";
import type { DataKnowledgeOverviewController } from "../../features/data-knowledge/hooks/useDataKnowledgeOverviewState";
import type { MetricsOverviewController } from "../../features/metrics/hooks/useMetricsOverviewState";
import type { PlatformOperationsOverviewController } from "../../features/platform-operations/hooks/usePlatformOperationsOverviewState";
import type { ReportsReaderController } from "../../features/reports/hooks/useReportsReaderState";

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type WebPageProps = {
  dataKnowledgeState?: DataKnowledgeOverviewController;
  metricsState?: MetricsOverviewController;
  onNavigate?: NavigateToRoute;
  platformOperationsState?: PlatformOperationsOverviewController;
  reportsState?: ReportsReaderController;
};
