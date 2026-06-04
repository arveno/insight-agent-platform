import { reportsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { ReportsSections } from "./sections";

export function ReportsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={reportsStaticViewModel}>
      <ReportsSections onNavigate={onNavigate} viewModel={reportsStaticViewModel} />
    </WebPageScaffold>
  );
}
