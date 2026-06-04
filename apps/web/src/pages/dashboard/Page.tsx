import { dashboardStaticViewModel } from "../../features/static-view-models";
import type { WebPageProps } from "../_shared";
import { DashboardSections } from "./sections";

export function DashboardPage({ onNavigate }: WebPageProps) {
  return <DashboardSections onNavigate={onNavigate} viewModel={dashboardStaticViewModel} />;
}
