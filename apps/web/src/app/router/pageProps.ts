import type { StaticRouteKey } from "../shell/models/staticViewModelTypes";
import type { DataKnowledgeOverviewController } from "../../modules/data-knowledge/hooks/useDataKnowledgeOverviewState";
import type { MetricsOverviewController } from "../../modules/metrics/hooks/useMetricsOverviewState";
import type { PlatformOperationsOverviewController } from "../../modules/platform-operations/hooks/usePlatformOperationsOverviewState";
import type { ReportsReaderController } from "../../modules/reports/hooks/useReportsReaderState";

export type NavigateToRoute = (route: StaticRouteKey) => void;

export type WebPageProps = {
  dataKnowledgeState?: DataKnowledgeOverviewController;
  metricsState?: MetricsOverviewController;
  onNavigate?: NavigateToRoute;
  platformOperationsState?: PlatformOperationsOverviewController;
  reportsState?: ReportsReaderController;
};
