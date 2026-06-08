export type DataSourceContract = {
  createdAt: string;
  dataSourceId: string;
  name: string;
  sourceType: string;
  workspaceId: string;
};

export type DataTableContract = {
  createdAt: string;
  dataSourceId: string;
  tableId: string;
  tableName: string;
};

export type DataFieldContract = {
  createdAt: string;
  dataType: string;
  fieldId: string;
  fieldName: string;
  tableId: string;
};

export type KnowledgeDocumentContract = {
  createdAt: string;
  knowledgeDocumentId: string;
  title: string;
  workspaceId: string;
};

export type KnowledgeChunkContract = {
  content: string;
  createdAt: string;
  knowledgeChunkId: string;
  knowledgeDocumentId: string;
};

export type SourceEvidenceContract = {
  confidence: number;
  createdAt: string;
  runId: string;
  snippet: string;
  sourceEvidenceId: string;
  sourceId: string;
  sourceType:
    | "analysis_memory"
    | "data_table"
    | "decision_memory"
    | "knowledge_chunk"
    | "knowledge_document"
    | "metric"
    | "sql_query";
  title: string;
};

export type DataQualityCheckContract = {
  createdAt: string;
  dataQualityCheckId: string;
  status: string;
  workspaceId: string;
};

export type DataKnowledgeStaticContracts = {
  dataFields: DataFieldContract[];
  dataQualityChecks: DataQualityCheckContract[];
  dataSources: DataSourceContract[];
  dataTables: DataTableContract[];
  knowledgeChunks: KnowledgeChunkContract[];
  knowledgeDocuments: KnowledgeDocumentContract[];
  sourceEvidences: SourceEvidenceContract[];
};
