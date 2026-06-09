import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { feedbackStaticViewModel } from "./fixtures/feedbackStaticViewModel";
import { FeedbackSections } from "./sections/FeedbackSections";

export function FeedbackPage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <FeedbackSections onNavigate={onNavigate} viewModel={feedbackStaticViewModel} />
    </ResponsivePageShell>
  );
}
