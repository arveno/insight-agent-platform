import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { useReportsReaderState, type ReportsReaderController } from "./hooks/useReportsReaderState";
import { ReportsSections } from "./sections/ReportsSections";

export type ReportsPageContentProps = PageRouteProps & {
  controller: ReportsReaderController;
};

export function ReportsPage({ onNavigate }: PageRouteProps) {
  const controller = useReportsReaderState();

  return <ReportsPageContent controller={controller} onNavigate={onNavigate} />;
}

export function ReportsPageContent({ controller, onNavigate }: ReportsPageContentProps) {
  return (
    <ResponsivePageShell>
      <ReportsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </ResponsivePageShell>
  );
}
