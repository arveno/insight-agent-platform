import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { WebPageProps } from "../../shared/navigation/navigationTypes";

import {
  useDataKnowledgeOverviewState,
  type DataKnowledgeOverviewController
} from "./hooks/useDataKnowledgeOverviewState";
import { DataKnowledgeSections } from "./sections/DataKnowledgeSections";

export type DataKnowledgePageProps = WebPageProps & {
  dataKnowledgeState?: DataKnowledgeOverviewController;
};

export function DataKnowledgePage({ dataKnowledgeState, onNavigate }: DataKnowledgePageProps) {
  const fallbackDataKnowledgeState = useDataKnowledgeOverviewState();
  const controller = dataKnowledgeState ?? fallbackDataKnowledgeState;

  return (
    <PageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <DataKnowledgeSections controller={controller} onNavigate={onNavigate} />
    </PageScaffold>
  );
}
