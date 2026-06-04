import { memoryStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { MemorySections } from "./sections";

export function MemoryPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={memoryStaticViewModel}>
      <MemorySections onNavigate={onNavigate} viewModel={memoryStaticViewModel} />
    </WebPageScaffold>
  );
}
