import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { feedbackStaticViewModel } from "./fixtures/feedbackStaticViewModel";
import { FeedbackSections } from "./sections/FeedbackSections";

export function FeedbackPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={feedbackStaticViewModel}>
      <FeedbackSections onNavigate={onNavigate} viewModel={feedbackStaticViewModel} />
    </WebPageScaffold>
  );
}
