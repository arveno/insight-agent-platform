SELECT CONCAT('runId=', run_id) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.status=', status) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.phase=', phase) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'analysisRun.completed.exists=',
  EXISTS(
    SELECT 1
    FROM analysis_runs
    WHERE run_id = '__RUN_ID__'
      AND status = 'completed'
  )
) AS check_line;

SELECT CONCAT('execution_attempts.run.row_count=', COUNT(*)) AS check_line
FROM execution_attempts
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('execution_attempts.released.row_count=', COUNT(*)) AS check_line
FROM execution_attempts
WHERE run_id = '__RUN_ID__'
  AND status = 'released';

SELECT CONCAT(
  'run_events.worker_claim.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'worker.lease_acquired'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.run_started.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'run.started'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.context_bound.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'context.bound'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.tool_requested.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'tool_call.requested'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.tool_completed.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'tool_call.completed'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.model_started.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'model_call.started'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.model_completed.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'model_call.completed'
  )
) AS check_line;

SELECT CONCAT(
  'run_events.synthesis.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'synthesis.started'
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

SELECT CONCAT('reports.run.row_count=', COUNT(*)) AS check_line
FROM reports
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('decisions.run.row_count=', COUNT(*)) AS check_line
FROM decisions
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('messages.assistant.run.row_count=', COUNT(*)) AS check_line
FROM messages
WHERE run_id = '__RUN_ID__'
  AND role = 'assistant';

SELECT CONCAT('message_streams.run.row_count=', COUNT(*)) AS check_line
FROM message_streams
WHERE run_id = '__RUN_ID__';
