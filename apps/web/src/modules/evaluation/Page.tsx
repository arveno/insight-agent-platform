import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { WebPageProps } from "../../shared/navigation/navigationTypes";

import { evaluationStaticViewModel } from "./fixtures/evaluationStaticViewModel";
import { EvaluationSections } from "./sections/EvaluationSections";

export function EvaluationPage({ onNavigate }: WebPageProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={evaluationStaticViewModel}>
      <EvaluationSections onNavigate={onNavigate} viewModel={evaluationStaticViewModel} />
    </PageScaffold>
  );
}
