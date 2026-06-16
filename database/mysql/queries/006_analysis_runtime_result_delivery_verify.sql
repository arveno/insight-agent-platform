SELECT CONCAT('runId=', run_id) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.status=', status) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.phase=', phase) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.outcome=', COALESCE(outcome, 'null')) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'analysisRun.completed.exists=',
  EXISTS(
    SELECT 1
    FROM analysis_runs
    WHERE run_id = '__RUN_ID__'
      AND status = 'completed'
      AND phase = 'delivery'
  )
) AS check_line;

SELECT CONCAT('tool_calls.run.row_count=', COUNT(*)) AS check_line
FROM tool_calls
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('model_calls.run.row_count=', COUNT(*)) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('source_evidence.run.row_count=', COUNT(*)) AS check_line
FROM source_evidence
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'source_evidence.channel.exists=',
  EXISTS(
    SELECT 1
    FROM source_evidence
    WHERE run_id = '__RUN_ID__'
      AND source_evidence_id = 'source-evidence-channel-weekly-17'
      AND source_id = 'knowledge-document-channel-weekly-17'
  )
) AS check_line;

SELECT CONCAT(
  'source_evidence.inventory.exists=',
  EXISTS(
    SELECT 1
    FROM source_evidence
    WHERE run_id = '__RUN_ID__'
      AND source_evidence_id = 'source-evidence-inventory-note-east-04'
      AND source_id = 'knowledge-document-inventory-east-04'
  )
) AS check_line;

SELECT CONCAT('reports.run.row_count=', COUNT(*)) AS check_line
FROM reports
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'report.revenue_gap.exists=',
  EXISTS(
    SELECT 1
    FROM reports
    WHERE run_id = '__RUN_ID__'
      AND report_id = 'report-revenue-gap-q2'
  )
) AS check_line;

SELECT CONCAT('decisions.run.row_count=', COUNT(*)) AS check_line
FROM decisions
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'decision.revenue_gap.exists=',
  EXISTS(
    SELECT 1
    FROM decisions
    WHERE run_id = '__RUN_ID__'
      AND decision_id = 'decision-revenue-gap-q2'
      AND report_id = 'report-revenue-gap-q2'
  )
) AS check_line;

SELECT CONCAT('messages.assistant.run.row_count=', COUNT(*)) AS check_line
FROM messages
WHERE run_id = '__RUN_ID__'
  AND role = 'assistant';

SELECT CONCAT(
  'message.report_link.exists=',
  EXISTS(
    SELECT 1
    FROM messages
    WHERE run_id = '__RUN_ID__'
      AND role = 'assistant'
      AND report_id = 'report-revenue-gap-q2'
  )
) AS check_line;

SELECT CONCAT(
  'message.source_evidence.channel.exists=',
  EXISTS(
    SELECT 1
    FROM messages
    WHERE run_id = '__RUN_ID__'
      AND role = 'assistant'
      AND JSON_CONTAINS(
        source_evidence_ids_json,
        JSON_QUOTE('source-evidence-channel-weekly-17')
      )
  )
) AS check_line;

SELECT CONCAT(
  'message.source_evidence.inventory.exists=',
  EXISTS(
    SELECT 1
    FROM messages
    WHERE run_id = '__RUN_ID__'
      AND role = 'assistant'
      AND JSON_CONTAINS(
        source_evidence_ids_json,
        JSON_QUOTE('source-evidence-inventory-note-east-04')
      )
  )
) AS check_line;

SELECT CONCAT('message_streams.run.row_count=', COUNT(*)) AS check_line
FROM message_streams
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'run_events.verification.started.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'verification.started'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.verification.passed.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'verification.passed'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.delivery.started.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'delivery.started'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.artifact.persisted.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'artifact.persisted'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.run.completed.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'run.completed'
  )
) AS check_line;
