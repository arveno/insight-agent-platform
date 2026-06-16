SET @messages_has_analysis_task_id := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'messages'
    AND column_name = 'analysis_task_id'
);

SET @add_messages_analysis_task_id_sql := IF(
  @messages_has_analysis_task_id = 0,
  'ALTER TABLE messages ADD COLUMN analysis_task_id VARCHAR(128) NULL AFTER conversation_id',
  'SELECT 1'
);
PREPARE add_messages_analysis_task_id_stmt FROM @add_messages_analysis_task_id_sql;
EXECUTE add_messages_analysis_task_id_stmt;
DEALLOCATE PREPARE add_messages_analysis_task_id_stmt;

UPDATE messages AS messages_table
INNER JOIN analysis_runs AS analysis_runs_table
  ON analysis_runs_table.run_id = messages_table.run_id
SET messages_table.analysis_task_id = analysis_runs_table.analysis_task_id
WHERE messages_table.analysis_task_id IS NULL
  AND messages_table.run_id IS NOT NULL
  AND analysis_runs_table.analysis_task_id IS NOT NULL;

SET @messages_has_analysis_task_id_index := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'messages'
    AND index_name = 'idx_messages_analysis_task_id'
);

SET @add_messages_analysis_task_id_index_sql := IF(
  @messages_has_analysis_task_id_index = 0,
  'ALTER TABLE messages ADD INDEX idx_messages_analysis_task_id (analysis_task_id)',
  'SELECT 1'
);
PREPARE add_messages_analysis_task_id_index_stmt FROM @add_messages_analysis_task_id_index_sql;
EXECUTE add_messages_analysis_task_id_index_stmt;
DEALLOCATE PREPARE add_messages_analysis_task_id_index_stmt;
