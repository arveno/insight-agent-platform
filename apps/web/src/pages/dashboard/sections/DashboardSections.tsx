import { Space } from "antd";

import type { DashboardViewModel } from "../../../features/static-view-models";
import type { WebPageProps } from "../../_shared";
import {
  DashboardHero,
  DashboardMetricOverview,
  DashboardQualityPanel,
  DashboardReportEvidencePanel,
  DashboardRiskOverview
} from "../components";

export type DashboardSectionsProps = WebPageProps & {
  viewModel: DashboardViewModel;
};

export function DashboardSections({ onNavigate, viewModel }: DashboardSectionsProps) {
  return (
    <Space direction="vertical" size={24} style={{ padding: 24, width: "100%" }}>
      <DashboardHero onNavigate={onNavigate} viewModel={viewModel} />
      <DashboardMetricOverview onNavigate={onNavigate} viewModel={viewModel} />
      <DashboardRiskOverview onNavigate={onNavigate} viewModel={viewModel} />
      <DashboardReportEvidencePanel onNavigate={onNavigate} viewModel={viewModel} />
      <DashboardQualityPanel onNavigate={onNavigate} viewModel={viewModel} />
    </Space>
  );
}
