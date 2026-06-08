import { useReportsReaderState } from "../../features/reports/hooks/useReportsReaderState";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
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
