import { useDataKnowledgeOverviewState } from "../../features/data-knowledge/hooks/useDataKnowledgeOverviewState";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
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
