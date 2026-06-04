import { Space } from "antd";

import type { DataKnowledgeViewModel } from "../../../features/static-view-models";
import { useI18n } from "../../../shared";
import {
  ActionBar,
  EvidencePanel,
  MetricCardGrid,
  SummaryCardGrid,
  SummaryTable,
  TabsPanel,
  WebSection,
  type WebPageProps
} from "../../_shared";

export type DataKnowledgeSectionsProps = WebPageProps & {
  viewModel: DataKnowledgeViewModel;
};

export function DataKnowledgeSections({ onNavigate, viewModel }: DataKnowledgeSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <TabsPanel
          tabs={viewModel.dataKnowledgeTabs}
          childrenByKey={{
            dataSources: (
              <SummaryTable items={[viewModel.selectedDataSource, ...viewModel.dataSources]} />
            ),
            knowledge: (
              <SummaryTable
                items={[viewModel.selectedKnowledgeDocument, ...viewModel.knowledgeDocuments]}
              />
            )
          }}
        />
        <SummaryTable
          items={[
            viewModel.selectedDataTable,
            ...viewModel.dataTables,
            viewModel.selectedDataField,
            ...viewModel.dataFields
          ]}
        />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid items={[viewModel.selectedKnowledgeChunk, ...viewModel.knowledgeChunks]} />
        <EvidencePanel items={viewModel.evidenceEntrances} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <SummaryCardGrid items={[...viewModel.qualitySummary, ...viewModel.schemaSyncSummary]} />
        <MetricCardGrid items={viewModel.metricCards} />
        <ActionBar
          actions={[
            ...viewModel.ingestionEntrances,
            ...viewModel.indexEntrances,
            ...viewModel.analysisContextEntrances
          ]}
          onNavigate={onNavigate}
          t={t}
        />
      </WebSection>
    </Space>
  );
}
