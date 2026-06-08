import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { useDataKnowledgeOverviewState } from "./hooks/useDataKnowledgeOverviewState";
import { DataKnowledgeSections } from "./sections/DataKnowledgeSections";

export function DataKnowledgePage({ dataKnowledgeState, onNavigate }: WebPageProps) {
  const fallbackDataKnowledgeState = useDataKnowledgeOverviewState();
  const controller = dataKnowledgeState ?? fallbackDataKnowledgeState;

  return (
    <WebPageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <DataKnowledgeSections controller={controller} onNavigate={onNavigate} />
    </WebPageScaffold>
  );
}
