import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { memoryStaticViewModel } from "./fixtures/memoryStaticViewModel";
import { MemorySections } from "./sections/MemorySections";

export function MemoryPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={memoryStaticViewModel}>
      <MemorySections onNavigate={onNavigate} viewModel={memoryStaticViewModel} />
    </WebPageScaffold>
  );
}
