import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { feedbackStaticViewModel } from "./fixtures/feedbackStaticViewModel";
import { FeedbackSections } from "./sections/FeedbackSections";

export function FeedbackPage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={feedbackStaticViewModel}>
      <FeedbackSections onNavigate={onNavigate} viewModel={feedbackStaticViewModel} />
    </PageScaffold>
  );
}
