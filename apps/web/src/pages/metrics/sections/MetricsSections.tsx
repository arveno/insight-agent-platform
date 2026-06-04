import { Space } from "antd";

import type { MetricsViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  EvidencePanel,
  MetricCardGrid,
  StaticChart,
  SummaryCardGrid,
  SummaryTable,
  WebSection,
  type WebPageProps
} from "../../_shared";

export type MetricsSectionsProps = WebPageProps & {
  viewModel: MetricsViewModel;
};

export function MetricsSections({ onNavigate, viewModel }: MetricsSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <MetricCardGrid items={viewModel.metricCards} />
        <SummaryTable items={[viewModel.selectedMetric, ...viewModel.metricCatalog]} />
        <ActionBar
          actions={[...viewModel.analysisEntrances, ...viewModel.dashboardEntrances]}
          onNavigate={onNavigate}
          t={t}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid items={[viewModel.metricFormula, ...viewModel.metricThresholds]} />
        <StaticChart titleKey={viewModel.mainSections[1].titleKey} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryTable items={[...viewModel.metricLineage, ...viewModel.relatedDataFields]} />
        <EvidencePanel items={viewModel.metricEvidenceEntrances} />
        <ActionBar actions={viewModel.anomalyEntrances} onNavigate={onNavigate} t={t} />
      </WebSection>
    </Space>
  );
}
