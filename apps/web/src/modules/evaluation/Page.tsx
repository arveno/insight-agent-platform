import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { evaluationStaticViewModel } from "./fixtures/evaluationStaticViewModel";
import { EvaluationSections } from "./sections/EvaluationSections";

export function EvaluationPage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <EvaluationSections onNavigate={onNavigate} viewModel={evaluationStaticViewModel} />
    </ResponsivePageShell>
  );
}
