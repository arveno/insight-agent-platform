SET @conversations_has_analysis_task_id_index := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'conversations'
    AND index_name = 'idx_conversations_analysis_task_id'
);

SET @drop_analysis_task_id_index_sql := IF(
  @conversations_has_analysis_task_id_index = 1,
  'ALTER TABLE conversations DROP INDEX idx_conversations_analysis_task_id',
  'SELECT 1'
);
PREPARE drop_analysis_task_id_index_stmt FROM @drop_analysis_task_id_index_sql;
EXECUTE drop_analysis_task_id_index_stmt;
DEALLOCATE PREPARE drop_analysis_task_id_index_stmt;

SET @conversations_has_analysis_task_id := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'conversations'
    AND column_name = 'analysis_task_id'
);

SET @drop_analysis_task_id_column_sql := IF(
  @conversations_has_analysis_task_id = 1,
  'ALTER TABLE conversations DROP COLUMN analysis_task_id',
  'SELECT 1'
);
PREPARE drop_analysis_task_id_column_stmt FROM @drop_analysis_task_id_column_sql;
EXECUTE drop_analysis_task_id_column_stmt;
DEALLOCATE PREPARE drop_analysis_task_id_column_stmt;
