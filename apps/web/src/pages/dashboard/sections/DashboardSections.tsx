import { Space } from "antd";

import type { DashboardViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  EvidencePanel,
  MetricCardGrid,
  ReportEntranceList,
  StaticChart,
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
        <SummaryCardGrid items={viewModel.dashboardSummary} />
        <MetricCardGrid items={viewModel.businessMetricCards} />
        <StaticChart
          metrics={viewModel.businessMetricCards}
          titleKey={viewModel.mainSections[0].titleKey}
        />
        <ActionBar actions={viewModel.analysisEntrances} onNavigate={onNavigate} t={t} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid items={viewModel.platformQualitySummary} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryCardGrid items={[...viewModel.anomalyCards, ...viewModel.riskSummary]} />
        <ReportEntranceList items={viewModel.recentReports.map((item) => toReportItem(t, item))} />
        <EvidencePanel items={viewModel.evidenceEntrances} />
      </WebSection>
    </Space>
  );
}
