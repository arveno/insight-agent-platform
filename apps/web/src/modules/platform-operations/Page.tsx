import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { usePlatformOperationsOverviewState } from "./hooks/usePlatformOperationsOverviewState";
import { PlatformOperationsSections } from "./sections/PlatformOperationsSections";

export function PlatformOperationsPage({ onNavigate, platformOperationsState }: WebPageProps) {
  const fallbackPlatformOperationsState = usePlatformOperationsOverviewState();
  const controller = platformOperationsState ?? fallbackPlatformOperationsState;

  return (
    <WebPageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <PlatformOperationsSections controller={controller} onNavigate={onNavigate} />
    </WebPageScaffold>
  );
}
