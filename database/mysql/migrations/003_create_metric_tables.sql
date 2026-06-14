CREATE TABLE IF NOT EXISTS metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  metric_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  business_domain_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  current_value VARCHAR(255) NOT NULL,
  unit VARCHAR(64) NULL,
  period VARCHAR(128) NOT NULL,
  trend_direction VARCHAR(16) NOT NULL,
  trend_value VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  risk_level VARCHAR(32) NOT NULL,
  owner_team VARCHAR(255) NOT NULL,
  formula_summary TEXT NOT NULL,
  threshold_summary TEXT NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_metrics_metric_id (metric_id),
  KEY idx_metrics_workspace_id (workspace_id),
  KEY idx_metrics_business_domain_id (business_domain_id)
);

CREATE TABLE IF NOT EXISTS metric_context_sources (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  metric_context_source_id VARCHAR(128) NOT NULL,
  metric_id VARCHAR(128) NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  source_id VARCHAR(128) NOT NULL,
  role VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_metric_context_sources_metric_context_source_id (metric_context_source_id),
  KEY idx_metric_context_sources_metric_id (metric_id),
  KEY idx_metric_context_sources_source_ref (source_type, source_id)
);
