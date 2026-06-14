SET @analysis_tasks_has_conversation_id := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'analysis_tasks'
    AND column_name = 'conversation_id'
);

SET @add_conversation_id_sql := IF(
  @analysis_tasks_has_conversation_id = 0,
  'ALTER TABLE analysis_tasks ADD COLUMN conversation_id VARCHAR(128) NULL AFTER analysis_task_id',
  'SELECT 1'
);
PREPARE add_conversation_id_stmt FROM @add_conversation_id_sql;
EXECUTE add_conversation_id_stmt;
DEALLOCATE PREPARE add_conversation_id_stmt;

SET @conversations_has_analysis_task_id := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'conversations'
    AND column_name = 'analysis_task_id'
);

SET @backfill_conversation_id_sql := IF(
  @conversations_has_analysis_task_id = 1,
  'UPDATE analysis_tasks AS analysis_tasks_table JOIN conversations AS conversations_table ON conversations_table.analysis_task_id = analysis_tasks_table.analysis_task_id SET analysis_tasks_table.conversation_id = conversations_table.conversation_id WHERE analysis_tasks_table.conversation_id IS NULL',
  'SELECT 1'
);
PREPARE backfill_conversation_id_stmt FROM @backfill_conversation_id_sql;
EXECUTE backfill_conversation_id_stmt;
DEALLOCATE PREPARE backfill_conversation_id_stmt;

SET @analysis_tasks_has_conversation_index := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'analysis_tasks'
    AND index_name = 'idx_analysis_tasks_conversation_id'
);

SET @add_conversation_index_sql := IF(
  @analysis_tasks_has_conversation_index = 0,
  'ALTER TABLE analysis_tasks ADD INDEX idx_analysis_tasks_conversation_id (conversation_id)',
  'SELECT 1'
);
PREPARE add_conversation_index_stmt FROM @add_conversation_index_sql;
EXECUTE add_conversation_index_stmt;
DEALLOCATE PREPARE add_conversation_index_stmt;

SET @analysis_tasks_missing_conversation_id := (
  SELECT COUNT(*)
  FROM analysis_tasks
  WHERE conversation_id IS NULL
);

SET @tighten_conversation_id_sql := IF(
  @analysis_tasks_missing_conversation_id = 0,
  'ALTER TABLE analysis_tasks MODIFY COLUMN conversation_id VARCHAR(128) NOT NULL',
  'SELECT 1'
);
PREPARE tighten_conversation_id_stmt FROM @tighten_conversation_id_sql;
EXECUTE tighten_conversation_id_stmt;
DEALLOCATE PREPARE tighten_conversation_id_stmt;
