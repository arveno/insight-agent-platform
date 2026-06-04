import { feedbackStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { FeedbackSections } from "./sections";

export function FeedbackPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={feedbackStaticViewModel}>
      <FeedbackSections onNavigate={onNavigate} viewModel={feedbackStaticViewModel} />
    </WebPageScaffold>
  );
}
