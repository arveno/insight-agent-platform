CREATE TABLE IF NOT EXISTS data_sources (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  data_source_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_data_sources_data_source_id (data_source_id),
  KEY idx_data_sources_workspace_id (workspace_id)
);

CREATE TABLE IF NOT EXISTS data_tables (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_id VARCHAR(128) NOT NULL,
  data_source_id VARCHAR(128) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_data_tables_table_id (table_id),
  KEY idx_data_tables_data_source_id (data_source_id)
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  knowledge_document_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_knowledge_documents_knowledge_document_id (knowledge_document_id),
  KEY idx_knowledge_documents_workspace_id (workspace_id)
);
