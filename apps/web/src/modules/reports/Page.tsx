import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useReportsReaderState,
  type ReportsReaderController
} from "./hooks/useReportsReaderState";
import { ReportsSections } from "./sections/ReportsSections";

export type ReportsPageProps = PageRouteProps & {
  reportsState?: ReportsReaderController;
};

export function ReportsPage({ onNavigate, reportsState }: ReportsPageProps) {
  const fallbackReportsState = useReportsReaderState();
  const controller = reportsState ?? fallbackReportsState;

  return (
    <PageScaffold onNavigate={onNavigate} viewModel={controller.viewModel}>
      <ReportsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </PageScaffold>
  );
}
