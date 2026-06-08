import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { useReportsReaderState } from "./hooks/useReportsReaderState";
import { ReportsSections } from "./sections/ReportsSections";

export function ReportsPage({ onNavigate, reportsState }: WebPageProps) {
  const fallbackReportsState = useReportsReaderState();
  const controller = reportsState ?? fallbackReportsState;

  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={controller.viewModel}>
      <ReportsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </WebPageScaffold>
  );
}
