-- #248 rollback note:
-- These columns are additive and nullable.
-- If schema rollback is required after application rollback, drop the new columns
-- from `model_calls` in reverse order after confirming no live code depends on them.

SET @model_calls_has_failure_class := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'failure_class'
);

SET @add_model_calls_failure_class_sql := IF(
  @model_calls_has_failure_class = 0,
  'ALTER TABLE model_calls ADD COLUMN failure_class VARCHAR(64) NULL AFTER error_message',
  'SELECT 1'
);
PREPARE add_model_calls_failure_class_stmt FROM @add_model_calls_failure_class_sql;
EXECUTE add_model_calls_failure_class_stmt;
DEALLOCATE PREPARE add_model_calls_failure_class_stmt;

SET @model_calls_has_http_status := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'http_status'
);

SET @add_model_calls_http_status_sql := IF(
  @model_calls_has_http_status = 0,
  'ALTER TABLE model_calls ADD COLUMN http_status INT NULL AFTER failure_class',
  'SELECT 1'
);
PREPARE add_model_calls_http_status_stmt FROM @add_model_calls_http_status_sql;
EXECUTE add_model_calls_http_status_stmt;
DEALLOCATE PREPARE add_model_calls_http_status_stmt;

SET @model_calls_has_provider_error_code := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'provider_error_code'
);

SET @add_model_calls_provider_error_code_sql := IF(
  @model_calls_has_provider_error_code = 0,
  'ALTER TABLE model_calls ADD COLUMN provider_error_code VARCHAR(128) NULL AFTER http_status',
  'SELECT 1'
);
PREPARE add_model_calls_provider_error_code_stmt FROM @add_model_calls_provider_error_code_sql;
EXECUTE add_model_calls_provider_error_code_stmt;
DEALLOCATE PREPARE add_model_calls_provider_error_code_stmt;

SET @model_calls_has_provider_request_id := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'provider_request_id'
);

SET @add_model_calls_provider_request_id_sql := IF(
  @model_calls_has_provider_request_id = 0,
  'ALTER TABLE model_calls ADD COLUMN provider_request_id VARCHAR(128) NULL AFTER provider_error_code',
  'SELECT 1'
);
PREPARE add_model_calls_provider_request_id_stmt FROM @add_model_calls_provider_request_id_sql;
EXECUTE add_model_calls_provider_request_id_stmt;
DEALLOCATE PREPARE add_model_calls_provider_request_id_stmt;

SET @model_calls_has_timeout_ms := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'timeout_ms'
);

SET @add_model_calls_timeout_ms_sql := IF(
  @model_calls_has_timeout_ms = 0,
  'ALTER TABLE model_calls ADD COLUMN timeout_ms INT NULL AFTER provider_request_id',
  'SELECT 1'
);
PREPARE add_model_calls_timeout_ms_stmt FROM @add_model_calls_timeout_ms_sql;
EXECUTE add_model_calls_timeout_ms_stmt;
DEALLOCATE PREPARE add_model_calls_timeout_ms_stmt;

SET @model_calls_has_retryable := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'retryable'
);

SET @add_model_calls_retryable_sql := IF(
  @model_calls_has_retryable = 0,
  'ALTER TABLE model_calls ADD COLUMN retryable TINYINT(1) NULL AFTER timeout_ms',
  'SELECT 1'
);
PREPARE add_model_calls_retryable_stmt FROM @add_model_calls_retryable_sql;
EXECUTE add_model_calls_retryable_stmt;
DEALLOCATE PREPARE add_model_calls_retryable_stmt;

SET @model_calls_has_retry_after_ms := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'retry_after_ms'
);

SET @add_model_calls_retry_after_ms_sql := IF(
  @model_calls_has_retry_after_ms = 0,
  'ALTER TABLE model_calls ADD COLUMN retry_after_ms INT NULL AFTER retryable',
  'SELECT 1'
);
PREPARE add_model_calls_retry_after_ms_stmt FROM @add_model_calls_retry_after_ms_sql;
EXECUTE add_model_calls_retry_after_ms_stmt;
DEALLOCATE PREPARE add_model_calls_retry_after_ms_stmt;

SET @model_calls_has_raw_error_redacted := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'model_calls'
    AND column_name = 'raw_error_redacted'
);

SET @add_model_calls_raw_error_redacted_sql := IF(
  @model_calls_has_raw_error_redacted = 0,
  'ALTER TABLE model_calls ADD COLUMN raw_error_redacted TEXT NULL AFTER retry_after_ms',
  'SELECT 1'
);
PREPARE add_model_calls_raw_error_redacted_stmt FROM @add_model_calls_raw_error_redacted_sql;
EXECUTE add_model_calls_raw_error_redacted_stmt;
DEALLOCATE PREPARE add_model_calls_raw_error_redacted_stmt;
