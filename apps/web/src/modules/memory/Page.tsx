import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { WebPageProps } from "../../shared/navigation/navigationTypes";

import { memoryStaticViewModel } from "./fixtures/memoryStaticViewModel";
import { MemorySections } from "./sections/MemorySections";

export function MemoryPage({ onNavigate }: WebPageProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={memoryStaticViewModel}>
      <MemorySections onNavigate={onNavigate} viewModel={memoryStaticViewModel} />
    </PageScaffold>
  );
}
