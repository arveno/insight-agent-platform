import { Space } from "antd";

import type { AnalysisViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  EvidencePanel,
  ReportEntranceList,
  SummaryCardGrid,
  SummaryTable,
  TracePanel,
  WebSection,
  toReportItem,
  type WebPageProps
} from "../../_shared";

export type AnalysisSectionsProps = WebPageProps & {
  viewModel: AnalysisViewModel;
};

export function AnalysisSections({ onNavigate, viewModel }: AnalysisSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <SummaryCardGrid items={[viewModel.analysisInput, ...viewModel.analysisContext]} />
        <ActionBar actions={[viewModel.followUpDraft]} onNavigate={onNavigate} t={t} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryTable
          items={[
            viewModel.runStatus,
            viewModel.selectedRun,
            viewModel.approvalState,
            viewModel.retryState,
            viewModel.streamingState,
            ...viewModel.runList
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryCardGrid items={viewModel.resultPreview} />
        <ReportEntranceList
          items={viewModel.reportEntrances.map((item) => toReportItem(t, item))}
        />
        <EvidencePanel items={viewModel.evidenceEntrances} />
        <TracePanel items={viewModel.traceEntrances} />
      </WebSection>
    </Space>
  );
}
