import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { memoryStaticViewModel } from "./fixtures/memoryStaticViewModel";
import { MemorySections } from "./sections/MemorySections";

export function MemoryPage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <MemorySections onNavigate={onNavigate} viewModel={memoryStaticViewModel} />
    </ResponsivePageShell>
  );
}
