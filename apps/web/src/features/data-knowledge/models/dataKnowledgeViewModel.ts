import type {
  StaticActionViewModel,
  StaticEvidenceEntranceViewModel,
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticSummaryItemViewModel,
  StaticTabViewModel
} from "../../../app/models";

export type DataKnowledgeViewModel = StaticPageViewModelBase & {
  analysisContextEntrances: StaticActionViewModel[];
  dataFields: StaticSummaryItemViewModel[];
  dataKnowledgeState: StaticPageStateViewModel;
  dataKnowledgeTabs: StaticTabViewModel[];
  dataSources: StaticSummaryItemViewModel[];
  dataTables: StaticSummaryItemViewModel[];
  evidenceEntrances: StaticEvidenceEntranceViewModel[];
  indexEntrances: StaticActionViewModel[];
  ingestionEntrances: StaticActionViewModel[];
  knowledgeChunks: StaticSummaryItemViewModel[];
  knowledgeDocuments: StaticSummaryItemViewModel[];
  qualitySummary: StaticSummaryItemViewModel[];
  schemaSyncSummary: StaticSummaryItemViewModel[];
  selectedDataField: StaticSummaryItemViewModel;
  selectedDataSource: StaticSummaryItemViewModel;
  selectedDataTable: StaticSummaryItemViewModel;
  selectedKnowledgeChunk: StaticSummaryItemViewModel;
  selectedKnowledgeDocument: StaticSummaryItemViewModel;
  selectedTab: string;
};
