import { memoryStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { MemorySections } from "./sections/MemorySections";

export function MemoryPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={memoryStaticViewModel}>
      <MemorySections onNavigate={onNavigate} viewModel={memoryStaticViewModel} />
    </WebPageScaffold>
  );
}
