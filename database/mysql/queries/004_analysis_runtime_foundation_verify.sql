SELECT CONCAT(
  'tables=',
  (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN (
        'users',
        'workspaces',
        'workspace_memberships',
        'auth_sessions',
        'analysis_tasks',
        'conversations',
        'analysis_runs',
        'execution_attempts',
        'run_events',
        'tool_calls',
        'model_calls',
        'source_evidence',
        'reports',
        'report_sections',
        'decisions',
        'messages',
        'message_streams'
      )
  )
) AS check_line;

SELECT CONCAT('users.row_count=', COUNT(*)) AS check_line
FROM users;

SELECT CONCAT('workspaces.row_count=', COUNT(*)) AS check_line
FROM workspaces;

SELECT CONCAT('workspace_memberships.row_count=', COUNT(*)) AS check_line
FROM workspace_memberships;

SELECT CONCAT(
  'auth_sessions.seedUser.exists=',
  EXISTS(
    SELECT 1
    FROM auth_sessions
    WHERE user_id = 'user-zoe'
  )
) AS check_line;

SELECT CONCAT(
  'auth_sessions.validSeedUserSession.exists=',
  EXISTS(
    SELECT 1
    FROM auth_sessions
    INNER JOIN workspace_memberships
      ON workspace_memberships.user_id = auth_sessions.user_id
     AND workspace_memberships.workspace_id = auth_sessions.current_workspace_id
    WHERE auth_sessions.user_id = 'user-zoe'
      AND auth_sessions.current_workspace_id IS NOT NULL
      AND auth_sessions.revoked_at IS NULL
      AND (
        CASE
          WHEN auth_sessions.expires_at LIKE '%Z' THEN
            STR_TO_DATE(
              REPLACE(REPLACE(auth_sessions.expires_at, 'T', ' '), 'Z', ''),
              '%Y-%m-%d %H:%i:%s'
            )
          WHEN auth_sessions.expires_at REGEXP '[+-][0-9]{2}:[0-9]{2}$' THEN
            CASE SUBSTRING(auth_sessions.expires_at, 20, 1)
              WHEN '+' THEN DATE_SUB(
                STR_TO_DATE(
                  SUBSTRING(auth_sessions.expires_at, 1, 19),
                  '%Y-%m-%dT%H:%i:%s'
                ),
                INTERVAL (
                  CAST(SUBSTRING(auth_sessions.expires_at, 21, 2) AS UNSIGNED) * 60
                  + CAST(SUBSTRING(auth_sessions.expires_at, 24, 2) AS UNSIGNED)
                ) MINUTE
              )
              ELSE DATE_ADD(
                STR_TO_DATE(
                  SUBSTRING(auth_sessions.expires_at, 1, 19),
                  '%Y-%m-%dT%H:%i:%s'
                ),
                INTERVAL (
                  CAST(SUBSTRING(auth_sessions.expires_at, 21, 2) AS UNSIGNED) * 60
                  + CAST(SUBSTRING(auth_sessions.expires_at, 24, 2) AS UNSIGNED)
                ) MINUTE
              )
            END
          ELSE STR_TO_DATE(
            REPLACE(auth_sessions.expires_at, 'T', ' '),
            '%Y-%m-%d %H:%i:%s'
          )
        END
      ) > UTC_TIMESTAMP()
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

SELECT CONCAT('tool_calls.row_count=', COUNT(*)) AS check_line
FROM tool_calls;

SELECT CONCAT('model_calls.row_count=', COUNT(*)) AS check_line
FROM model_calls;

SELECT CONCAT('source_evidence.row_count=', COUNT(*)) AS check_line
FROM source_evidence;

SELECT CONCAT('reports.row_count=', COUNT(*)) AS check_line
FROM reports;

SELECT CONCAT('report_sections.row_count=', COUNT(*)) AS check_line
FROM report_sections;

SELECT CONCAT('decisions.row_count=', COUNT(*)) AS check_line
FROM decisions;

SELECT CONCAT('messages.row_count=', COUNT(*)) AS check_line
FROM messages;

SELECT CONCAT('message_streams.row_count=', COUNT(*)) AS check_line
FROM message_streams;

SELECT CONCAT('user.userId=', user_id) AS check_line
FROM users
WHERE user_id = 'user-zoe';

SELECT CONCAT('workspace.primary.workspaceId=', workspace_id) AS check_line
FROM workspaces
WHERE workspace_id = 'workspace-northstar-retail-china';

SELECT CONCAT('workspace.secondary.workspaceId=', workspace_id) AS check_line
FROM workspaces
WHERE workspace_id = 'workspace-northstar-retail-sea';

SELECT CONCAT('membership.primary.role=', role) AS check_line
FROM workspace_memberships
WHERE membership_id = 'membership-user-zoe-northstar-retail-china';

SELECT CONCAT('membership.secondary.role=', role) AS check_line
FROM workspace_memberships
WHERE membership_id = 'membership-user-zoe-northstar-retail-sea';

SELECT CONCAT('analysisTaskId=', analysis_task_id) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT('analysisTask.conversationId=', conversation_id) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT('conversationId=', conversation_id) AS check_line
FROM conversations
WHERE conversation_id = 'conversation-revenue-gap-q2';

SELECT CONCAT('runId=', run_id) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';

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
