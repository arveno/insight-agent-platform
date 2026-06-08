import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { evaluationStaticViewModel } from "./fixtures/evaluationStaticViewModel";
import { EvaluationSections } from "./sections/EvaluationSections";

export function EvaluationPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={evaluationStaticViewModel}>
      <EvaluationSections onNavigate={onNavigate} viewModel={evaluationStaticViewModel} />
    </WebPageScaffold>
  );
}
