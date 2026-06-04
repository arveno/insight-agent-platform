import { evaluationStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { EvaluationSections } from "./sections";

export function EvaluationPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={evaluationStaticViewModel}>
      <EvaluationSections onNavigate={onNavigate} viewModel={evaluationStaticViewModel} />
    </WebPageScaffold>
  );
}
