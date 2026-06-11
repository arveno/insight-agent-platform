CREATE TABLE IF NOT EXISTS source_evidence (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  source_evidence_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  source_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  snippet TEXT NOT NULL,
  metadata_json JSON NULL,
  confidence DOUBLE NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_source_evidence_source_evidence_id (source_evidence_id),
  KEY idx_source_evidence_run_id (run_id),
  KEY idx_source_evidence_source_type_source_id (source_type, source_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  source_evidence_json JSON NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_reports_report_id (report_id),
  KEY idx_reports_run_id (run_id),
  KEY idx_reports_workspace_id (workspace_id)
);

CREATE TABLE IF NOT EXISTS report_sections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_section_id VARCHAR(128) NOT NULL,
  report_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_report_sections_report_section_id (report_section_id),
  KEY idx_report_sections_report_id (report_id)
);

CREATE TABLE IF NOT EXISTS decisions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  decision_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  report_id VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_decisions_decision_id (decision_id),
  KEY idx_decisions_run_id (run_id),
  KEY idx_decisions_report_id (report_id),
  KEY idx_decisions_workspace_id (workspace_id)
);
