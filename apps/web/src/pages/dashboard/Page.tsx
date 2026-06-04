import { dashboardStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { DashboardSections } from "./sections";

export function DashboardPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={dashboardStaticViewModel}>
      <DashboardSections onNavigate={onNavigate} viewModel={dashboardStaticViewModel} />
    </WebPageScaffold>
  );
}
