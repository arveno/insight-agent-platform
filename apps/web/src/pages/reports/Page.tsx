import { useReportsReaderState } from "../../features/reports/hooks";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { ReportsSections } from "./sections";

export function ReportsPage({ onNavigate, reportsState }: WebPageProps) {
  const fallbackReportsState = useReportsReaderState();
  const controller = reportsState ?? fallbackReportsState;

  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={controller.viewModel}>
      <ReportsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </WebPageScaffold>
  );
}
