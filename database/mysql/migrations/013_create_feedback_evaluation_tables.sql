CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  feedback_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  report_id VARCHAR(128) NOT NULL,
  feedback_type VARCHAR(64) NOT NULL,
  comment TEXT NULL,
  correction TEXT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_feedback_feedback_id (feedback_id),
  KEY idx_feedback_workspace_user (workspace_id, user_id),
  KEY idx_feedback_run_id (run_id),
  KEY idx_feedback_report_id (report_id)
);

CREATE TABLE IF NOT EXISTS evaluation_datasets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  dataset_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_evaluation_datasets_dataset_id (dataset_id),
  KEY idx_evaluation_datasets_workspace_id (workspace_id)
);

CREATE TABLE IF NOT EXISTS evaluation_runs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  evaluation_run_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  dataset_id VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  score DOUBLE NULL,
  failure_reason TEXT NULL,
  created_at VARCHAR(40) NOT NULL,
  completed_at VARCHAR(40) NULL,
  UNIQUE KEY uq_evaluation_runs_evaluation_run_id (evaluation_run_id),
  KEY idx_evaluation_runs_workspace_id (workspace_id),
  KEY idx_evaluation_runs_run_id (run_id),
  KEY idx_evaluation_runs_dataset_id (dataset_id)
);

CREATE TABLE IF NOT EXISTS evaluation_scores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  evaluation_score_id VARCHAR(128) NOT NULL,
  evaluation_run_id VARCHAR(128) NOT NULL,
  score DOUBLE NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_evaluation_scores_evaluation_score_id (evaluation_score_id),
  KEY idx_evaluation_scores_evaluation_run_id (evaluation_run_id)
);

CREATE TABLE IF NOT EXISTS bad_cases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  bad_case_id VARCHAR(128) NOT NULL,
  workspace_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  feedback_id VARCHAR(128) NULL,
  evaluation_run_id VARCHAR(128) NULL,
  failure_type VARCHAR(128) NOT NULL,
  failure_reason TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  related_rule VARCHAR(255) NULL,
  related_contract VARCHAR(255) NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_bad_cases_bad_case_id (bad_case_id),
  KEY idx_bad_cases_workspace_id (workspace_id),
  KEY idx_bad_cases_run_id (run_id),
  KEY idx_bad_cases_feedback_id (feedback_id),
  KEY idx_bad_cases_evaluation_run_id (evaluation_run_id)
);
