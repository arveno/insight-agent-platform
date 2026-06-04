import { platformOperationsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { PlatformOperationsSections } from "./sections";

export function PlatformOperationsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={platformOperationsStaticViewModel}>
      <PlatformOperationsSections
        onNavigate={onNavigate}
        viewModel={platformOperationsStaticViewModel}
      />
    </WebPageScaffold>
  );
}
