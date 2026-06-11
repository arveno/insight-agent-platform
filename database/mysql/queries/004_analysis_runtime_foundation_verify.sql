SELECT CONCAT(
  'tables=',
  (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN (
        'analysis_tasks',
        'conversations',
        'analysis_runs',
        'execution_attempts',
        'run_events'
      )
  )
) AS check_line;

SELECT CONCAT('analysis_tasks.row_count=', COUNT(*)) AS check_line
FROM analysis_tasks;

SELECT CONCAT('conversations.row_count=', COUNT(*)) AS check_line
FROM conversations;

SELECT CONCAT('analysis_runs.row_count=', COUNT(*)) AS check_line
FROM analysis_runs;

SELECT CONCAT('execution_attempts.row_count=', COUNT(*)) AS check_line
FROM execution_attempts;

SELECT CONCAT('run_events.row_count=', COUNT(*)) AS check_line
FROM run_events;

SELECT CONCAT('analysisTaskId=', analysis_task_id) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT('conversationId=', conversation_id) AS check_line
FROM conversations
WHERE conversation_id = 'conversation-revenue-gap-q2';

SELECT CONCAT('runId=', run_id) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';

SELECT CONCAT('conversation.analysisTaskId=', analysis_task_id) AS check_line
FROM conversations
WHERE conversation_id = 'conversation-revenue-gap-q2';

SELECT CONCAT('conversation.currentRunId=', current_run_id) AS check_line
FROM conversations
WHERE conversation_id = 'conversation-revenue-gap-q2';

SELECT CONCAT('analysisRun.analysisTaskId=', analysis_task_id) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';

SELECT CONCAT('analysisTask.businessDomainId=', business_domain_id) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT(
  'analysisTask.contextPack.metricId=',
  JSON_UNQUOTE(JSON_EXTRACT(context_pack_json, '$.metricId'))
) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT(
  'analysisTask.contextPack.tableIds=',
  JSON_UNQUOTE(JSON_EXTRACT(context_pack_json, '$.tableIds[0]')),
  ',',
  JSON_UNQUOTE(JSON_EXTRACT(context_pack_json, '$.tableIds[1]'))
) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT(
  'analysisTask.contextPack.knowledgeDocumentIds=',
  JSON_UNQUOTE(JSON_EXTRACT(context_pack_json, '$.knowledgeDocumentIds[0]')),
  ',',
  JSON_UNQUOTE(JSON_EXTRACT(context_pack_json, '$.knowledgeDocumentIds[1]'))
) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT('analysisRun.status=', status) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';

SELECT CONCAT('analysisRun.phase=', phase) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';
