import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useDataKnowledgeOverviewState,
  type DataKnowledgeOverviewController
} from "./hooks/useDataKnowledgeOverviewState";
import { DataKnowledgeSections } from "./sections/DataKnowledgeSections";

export type DataKnowledgePageProps = PageRouteProps & {
  dataKnowledgeState?: DataKnowledgeOverviewController;
};

export function DataKnowledgePage({ dataKnowledgeState, onNavigate }: DataKnowledgePageProps) {
  const fallbackDataKnowledgeState = useDataKnowledgeOverviewState();
  const controller = dataKnowledgeState ?? fallbackDataKnowledgeState;

  return (
    <ResponsivePageShell>
      <DataKnowledgeSections controller={controller} onNavigate={onNavigate} />
    </ResponsivePageShell>
  );
}
