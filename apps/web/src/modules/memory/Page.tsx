import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { memoryStaticViewModel } from "./fixtures/memoryStaticViewModel";
import { MemorySections } from "./sections/MemorySections";

export function MemoryPage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold hideHeader onNavigate={onNavigate} viewModel={memoryStaticViewModel}>
      <MemorySections onNavigate={onNavigate} viewModel={memoryStaticViewModel} />
    </PageScaffold>
  );
}
