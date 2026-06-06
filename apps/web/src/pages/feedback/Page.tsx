import { feedbackStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { FeedbackSections } from "./sections/FeedbackSections";

export function FeedbackPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={feedbackStaticViewModel}>
      <FeedbackSections onNavigate={onNavigate} viewModel={feedbackStaticViewModel} />
    </WebPageScaffold>
  );
}
