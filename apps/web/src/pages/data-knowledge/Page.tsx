import { dataKnowledgeStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { DataKnowledgeSections } from "./sections";

export function DataKnowledgePage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={dataKnowledgeStaticViewModel}>
      <DataKnowledgeSections onNavigate={onNavigate} viewModel={dataKnowledgeStaticViewModel} />
    </WebPageScaffold>
  );
}
