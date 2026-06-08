import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { WebPageProps } from "../../shared/navigation/navigationTypes";

import { feedbackStaticViewModel } from "./fixtures/feedbackStaticViewModel";
import { FeedbackSections } from "./sections/FeedbackSections";

export function FeedbackPage({ onNavigate }: WebPageProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={feedbackStaticViewModel}>
      <FeedbackSections onNavigate={onNavigate} viewModel={feedbackStaticViewModel} />
    </PageScaffold>
  );
}
