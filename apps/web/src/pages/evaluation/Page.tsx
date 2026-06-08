import { evaluationStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { EvaluationSections } from "./sections/EvaluationSections";

export function EvaluationPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={evaluationStaticViewModel}>
      <EvaluationSections onNavigate={onNavigate} viewModel={evaluationStaticViewModel} />
    </WebPageScaffold>
  );
}
