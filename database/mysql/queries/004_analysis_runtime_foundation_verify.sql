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
        'data_sources',
        'data_tables',
        'knowledge_documents',
        'metrics',
        'metric_context_sources',
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

SELECT CONCAT('data_sources.row_count=', COUNT(*)) AS check_line
FROM data_sources;

SELECT CONCAT('data_tables.row_count=', COUNT(*)) AS check_line
FROM data_tables;

SELECT CONCAT('knowledge_documents.row_count=', COUNT(*)) AS check_line
FROM knowledge_documents;

SELECT CONCAT(
  'metrics.china.row_count=',
  COUNT(*)
) AS check_line
FROM metrics
WHERE workspace_id = 'workspace-northstar-retail-china';

SELECT CONCAT(
  'metrics.sea.row_count=',
  COUNT(*)
) AS check_line
FROM metrics
WHERE workspace_id = 'workspace-northstar-retail-sea';

SELECT CONCAT('metric_context_sources.row_count=', COUNT(*)) AS check_line
FROM metric_context_sources;

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
  JSON_UNQUOTE(
    JSON_EXTRACT(context_pack_json, '$.root.children[1].sourceRef.metricId')
  )
) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT(
  'analysisTask.contextPack.root.kind=',
  JSON_UNQUOTE(JSON_EXTRACT(context_pack_json, '$.root.kind'))
) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT(
  'analysisTask.contextPack.reportId=',
  JSON_UNQUOTE(
    JSON_EXTRACT(context_pack_json, '$.root.children[0].sourceRef.reportId')
  )
) AS check_line
FROM analysis_tasks
WHERE analysis_task_id = 'analysis-task-revenue-gap-q2';

SELECT CONCAT('analysisRun.status=', status) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';

SELECT CONCAT('analysisRun.phase=', phase) AS check_line
FROM analysis_runs
WHERE run_id = 'analysis-q2-revenue-gap';

SELECT CONCAT(
  'metric.recognizedRevenue.exists=',
  EXISTS(
    SELECT 1
    FROM metrics
    WHERE metric_id = 'metric-recognized-revenue'
      AND workspace_id = 'workspace-northstar-retail-china'
  )
) AS check_line;

SELECT CONCAT(
  'metric.grossMargin.exists=',
  EXISTS(
    SELECT 1
    FROM metrics
    WHERE metric_id = 'metric-gross-margin'
      AND workspace_id = 'workspace-northstar-retail-china'
  )
) AS check_line;

SELECT CONCAT(
  'metric.refundRate.exists=',
  EXISTS(
    SELECT 1
    FROM metrics
    WHERE metric_id = 'metric-refund-rate'
      AND workspace_id = 'workspace-northstar-retail-china'
  )
) AS check_line;

SELECT CONCAT(
  'metric.inventoryTurnover.exists=',
  EXISTS(
    SELECT 1
    FROM metrics
    WHERE metric_id = 'metric-inventory-turnover'
      AND workspace_id = 'workspace-northstar-retail-china'
  )
) AS check_line;

SELECT CONCAT(
  'metric.seaRecognizedRevenue.exists=',
  EXISTS(
    SELECT 1
    FROM metrics
    WHERE metric_id = 'metric-sea-recognized-revenue'
      AND workspace_id = 'workspace-northstar-retail-sea'
  )
) AS check_line;

SELECT CONCAT(
  'metric.seaDeliveryDelayRate.exists=',
  EXISTS(
    SELECT 1
    FROM metrics
    WHERE metric_id = 'metric-sea-delivery-delay-rate'
      AND workspace_id = 'workspace-northstar-retail-sea'
  )
) AS check_line;

SELECT CONCAT(
  'metricContextSources.recognizedRevenue.exists=',
  EXISTS(
    SELECT 1
    FROM metric_context_sources
    WHERE metric_id = 'metric-recognized-revenue'
      AND source_id = 'table-sales-order'
      AND source_type = 'dataTable'
  )
) AS check_line;

SELECT CONCAT(
  'metricContextSources.seaDeliveryDelay.exists=',
  EXISTS(
    SELECT 1
    FROM metric_context_sources
    WHERE metric_id = 'metric-sea-delivery-delay-rate'
      AND source_id = 'table-sea-delivery-fulfillment'
      AND source_type = 'dataTable'
  )
) AS check_line;

SELECT CONCAT(
  'metricContextSources.unresolved.row_count=',
  COUNT(*)
) AS check_line
FROM metric_context_sources
WHERE CASE source_type
  WHEN 'dataTable' THEN NOT EXISTS(
    SELECT 1
    FROM data_tables
    WHERE table_id = metric_context_sources.source_id
  )
  WHEN 'knowledgeDocument' THEN NOT EXISTS(
    SELECT 1
    FROM knowledge_documents
    WHERE knowledge_document_id = metric_context_sources.source_id
  )
  WHEN 'report' THEN NOT EXISTS(
    SELECT 1
    FROM reports
    WHERE report_id = metric_context_sources.source_id
  )
  WHEN 'sourceEvidence' THEN NOT EXISTS(
    SELECT 1
    FROM source_evidence
    WHERE source_evidence_id = metric_context_sources.source_id
  )
  ELSE TRUE
END;

SELECT CONCAT(
  'dataTables.unresolvedDataSource.row_count=',
  COUNT(*)
) AS check_line
FROM data_tables
WHERE NOT EXISTS(
  SELECT 1
  FROM data_sources
  WHERE data_source_id = data_tables.data_source_id
);

SELECT CONCAT(
  'sourceEvidence.unresolvedRun.row_count=',
  COUNT(*)
) AS check_line
FROM source_evidence
WHERE NOT EXISTS(
  SELECT 1
  FROM analysis_runs
  WHERE run_id = source_evidence.run_id
);

SELECT CONCAT(
  'sourceEvidence.unresolvedSource.row_count=',
  COUNT(*)
) AS check_line
FROM source_evidence
WHERE CASE source_type
  WHEN 'data_table' THEN NOT EXISTS(
    SELECT 1
    FROM data_tables
    WHERE table_id = source_evidence.source_id
  )
  WHEN 'knowledge_document' THEN NOT EXISTS(
    SELECT 1
    FROM knowledge_documents
    WHERE knowledge_document_id = source_evidence.source_id
  )
  ELSE FALSE
END;

SELECT CONCAT(
  'reports.unresolvedRun.row_count=',
  COUNT(*)
) AS check_line
FROM reports
WHERE NOT EXISTS(
  SELECT 1
  FROM analysis_runs
  WHERE run_id = reports.run_id
);

SELECT CONCAT(
  'reports.unresolvedSourceEvidence.row_count=',
  COUNT(*)
) AS check_line
FROM reports
WHERE EXISTS(
  SELECT 1
  FROM JSON_TABLE(
    reports.source_evidence_json,
    '$[*]' COLUMNS (source_evidence_id VARCHAR(128) PATH '$')
  ) AS report_source_evidence
  WHERE NOT EXISTS(
    SELECT 1
    FROM source_evidence
    WHERE source_evidence_id = report_source_evidence.source_evidence_id
  )
);
