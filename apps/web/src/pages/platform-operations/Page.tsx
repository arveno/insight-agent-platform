import { usePlatformOperationsOverviewState } from "../../features/platform-operations/hooks";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { PlatformOperationsSections } from "./sections";

export function PlatformOperationsPage({ onNavigate, platformOperationsState }: WebPageProps) {
  const fallbackPlatformOperationsState = usePlatformOperationsOverviewState();
  const controller = platformOperationsState ?? fallbackPlatformOperationsState;

  return (
    <WebPageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <PlatformOperationsSections controller={controller} onNavigate={onNavigate} />
    </WebPageScaffold>
  );
}
