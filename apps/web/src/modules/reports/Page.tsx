import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { useReportsReaderState, type ReportsReaderController } from "./hooks/useReportsReaderState";
import { ReportsSections } from "./sections/ReportsSections";

export type ReportsPageProps = PageRouteProps & {
  reportsState?: ReportsReaderController;
};

export function ReportsPage({ onNavigate, reportsState }: ReportsPageProps) {
  const fallbackReportsState = useReportsReaderState();
  const controller = reportsState ?? fallbackReportsState;

  return (
    <ResponsivePageShell>
      <ReportsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </ResponsivePageShell>
  );
}
