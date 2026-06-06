import { useDataKnowledgeOverviewState } from "../../features/data-knowledge/hooks";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { DataKnowledgeSections } from "./sections";

export function DataKnowledgePage({ dataKnowledgeState, onNavigate }: WebPageProps) {
  const fallbackDataKnowledgeState = useDataKnowledgeOverviewState();
  const controller = dataKnowledgeState ?? fallbackDataKnowledgeState;

  return (
    <WebPageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <DataKnowledgeSections controller={controller} onNavigate={onNavigate} />
    </WebPageScaffold>
  );
}
