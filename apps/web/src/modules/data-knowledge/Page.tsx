import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useDataKnowledgeOverviewState,
  type DataKnowledgeOverviewController
} from "./hooks/useDataKnowledgeOverviewState";
import { DataKnowledgeSections } from "./sections/DataKnowledgeSections";

export type DataKnowledgePageContentProps = PageRouteProps & {
  controller: DataKnowledgeOverviewController;
};

export function DataKnowledgePage({ onNavigate }: PageRouteProps) {
  const controller = useDataKnowledgeOverviewState();

  return <DataKnowledgePageContent controller={controller} onNavigate={onNavigate} />;
}

export function DataKnowledgePageContent({
  controller,
  onNavigate
}: DataKnowledgePageContentProps) {
  return (
    <ResponsivePageShell>
      <DataKnowledgeSections controller={controller} onNavigate={onNavigate} />
    </ResponsivePageShell>
  );
}
