import type {
  StaticPageStateViewModel,
  StaticPageViewModelBase,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticTabViewModel
} from "../../../app/models";

export type DataKnowledgeAssetKind = "data_source" | "knowledge_document";

export type DataKnowledgeWorkspaceBindingViewModel = {
  workspaceId: string;
  workspaceName: string;
};

export type DataKnowledgeAssetListItemViewModel = {
  key: string;
  kind: DataKnowledgeAssetKind;
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  subtitle?: string;
  title: string;
};

export type DataKnowledgeSelectedAssetViewModel = {
  createdAt: string;
  dataSource?: {
    createdAt: string;
    dataSourceId: string;
    name: string;
    sourceType: string;
  };
  key: string;
  kind: DataKnowledgeAssetKind;
  knowledgeDocument?: {
    createdAt: string;
    knowledgeDocumentId: string;
    title: string;
  };
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  summary: string;
  title: string;
  workspaceId: string;
};

export type DataKnowledgeTableViewModel = {
  createdAt: string;
  dataSourceId: string;
  fieldCount: number;
  summary: string;
  tableId: string;
  tableName: string;
};

export type DataKnowledgeFieldViewModel = {
  createdAt: string;
  dataType: string;
  fieldId: string;
  fieldName: string;
  summary: string;
  tableId: string;
};

export type DataKnowledgeChunkViewModel = {
  contentPreview: string;
  createdAt: string;
  knowledgeChunkId: string;
  knowledgeDocumentId: string;
  summary: string;
};

export type DataKnowledgeEvidenceViewModel = {
  confidence: number;
  confidenceText: string;
  createdAt: string;
  runId: string;
  snippet: string;
  sourceEvidenceId: string;
  sourceId: string;
  sourceType: string;
  title: string;
};

export type DataKnowledgeQualityCheckViewModel = {
  createdAt: string;
  dataQualityCheckId: string;
  risk?: StaticRiskViewModel;
  status: string;
  statusLabel: string;
  statusView?: StaticStatusViewModel;
  summary: string;
  title: string;
  workspaceId: string;
};

export type DataKnowledgeViewModel = StaticPageViewModelBase & {
  assetItems: DataKnowledgeAssetListItemViewModel[];
  chunks: DataKnowledgeChunkViewModel[];
  dataKnowledgeState: StaticPageStateViewModel;
  evidenceItems: DataKnowledgeEvidenceViewModel[];
  fields: DataKnowledgeFieldViewModel[];
  qualityChecks: DataKnowledgeQualityCheckViewModel[];
  readonlyNotice: string;
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
  tabs: StaticTabViewModel[];
  tables: DataKnowledgeTableViewModel[];
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel;
  workspaceNotice: string;
};
