import { usePlatformOperationsOverviewState } from "../../features/platform-operations/hooks/usePlatformOperationsOverviewState";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
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
