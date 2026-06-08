import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { WebPageProps } from "../../shared/navigation/navigationTypes";

import {
  usePlatformOperationsOverviewState,
  type PlatformOperationsOverviewController
} from "./hooks/usePlatformOperationsOverviewState";
import { PlatformOperationsSections } from "./sections/PlatformOperationsSections";

export type PlatformOperationsPageProps = WebPageProps & {
  platformOperationsState?: PlatformOperationsOverviewController;
};

export function PlatformOperationsPage({
  onNavigate,
  platformOperationsState
}: PlatformOperationsPageProps) {
  const fallbackPlatformOperationsState = usePlatformOperationsOverviewState();
  const controller = platformOperationsState ?? fallbackPlatformOperationsState;

  return (
    <PageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <PlatformOperationsSections controller={controller} onNavigate={onNavigate} />
    </PageScaffold>
  );
}
