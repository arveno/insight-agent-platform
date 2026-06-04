import { Space } from "antd";

import type { DashboardViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  EvidencePanel,
  MetricCardGrid,
  ReportEntranceList,
  SummaryCardGrid,
  WebSection,
  toReportItem,
  type WebPageProps
} from "../../_shared";

export type DashboardSectionsProps = WebPageProps & {
  viewModel: DashboardViewModel;
};

export function DashboardSections({ onNavigate, viewModel }: DashboardSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <MetricCardGrid items={viewModel.businessMetricCards} />
        <SummaryCardGrid items={viewModel.dashboardSummary} />
        <ActionBar actions={viewModel.analysisEntrances} onNavigate={onNavigate} t={t} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryCardGrid items={[...viewModel.anomalyCards, ...viewModel.riskSummary]} />
        <ReportEntranceList items={viewModel.recentReports.map((item) => toReportItem(t, item))} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid items={viewModel.platformQualitySummary} />
        <EvidencePanel items={viewModel.evidenceEntrances} />
      </WebSection>
    </Space>
  );
}
