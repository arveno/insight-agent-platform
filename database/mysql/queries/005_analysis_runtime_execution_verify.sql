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

SELECT CONCAT(
  'messages.assistant.placeholder.exists=',
  EXISTS(
    SELECT 1
    FROM messages
    WHERE run_id = '__RUN_ID__'
      AND role = 'assistant'
      AND message_id = CONCAT('message-', '__RUN_ID__', '-assistant')
      AND status = 'streaming'
      AND report_id IS NULL
      AND completed_at IS NULL
      AND COALESCE(JSON_LENGTH(source_evidence_ids_json), 0) = 0
  )
) AS check_line;

SELECT CONCAT('message_streams.run.row_count=', COUNT(*)) AS check_line
FROM message_streams
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'message_streams.message_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM message_streams message_stream
    LEFT JOIN messages message
      ON message.message_id = message_stream.message_id
     AND message.run_id = message_stream.run_id
    WHERE message_stream.run_id = '__RUN_ID__'
      AND message.message_id IS NULL
  )
) AS check_line;

SELECT CONCAT(
  'message_streams.conversation_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM message_streams message_stream
    LEFT JOIN messages message
      ON message.message_id = message_stream.message_id
    LEFT JOIN conversations conversation
      ON conversation.conversation_id = message_stream.conversation_id
    WHERE message_stream.run_id = '__RUN_ID__'
      AND (
        message.message_id IS NULL
        OR conversation.conversation_id IS NULL
        OR message.conversation_id <> message_stream.conversation_id
      )
  )
) AS check_line;

SELECT CONCAT(
  'message_streams.run_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM message_streams message_stream
    LEFT JOIN analysis_runs analysis_run
      ON analysis_run.run_id = message_stream.run_id
    WHERE message_stream.run_id = '__RUN_ID__'
      AND analysis_run.run_id IS NULL
  )
) AS check_line;

SELECT CONCAT(
  'message_streams.sequence.contiguous=',
  CASE
    WHEN COUNT(*) = 0 THEN 0
    WHEN MIN(sequence_number) = 0
      AND MAX(sequence_number) = COUNT(*) - 1
      AND COUNT(DISTINCT sequence_number) = COUNT(*)
    THEN 1
    ELSE 0
  END
) AS check_line
FROM message_streams
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'message_streams.terminal.exists=',
  EXISTS(
    SELECT 1
    FROM message_streams
    WHERE run_id = '__RUN_ID__'
      AND event_type IN ('stream.completed', 'stream.failed', 'stream.cancelled')
  )
) AS check_line;

SELECT CONCAT(
  'message_streams.terminal.single=',
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM message_streams
      WHERE run_id = '__RUN_ID__'
        AND event_type IN ('stream.completed', 'stream.failed', 'stream.cancelled')
    ) = 1
    THEN 1
    ELSE 0
  END
) AS check_line;

SELECT CONCAT(
  'message_streams.no_orphans=',
  NOT EXISTS(
    SELECT 1
    FROM message_streams message_stream
    LEFT JOIN messages message
      ON message.message_id = message_stream.message_id
     AND message.run_id = message_stream.run_id
    LEFT JOIN conversations conversation
      ON conversation.conversation_id = message_stream.conversation_id
    LEFT JOIN analysis_runs analysis_run
      ON analysis_run.run_id = message_stream.run_id
    WHERE message_stream.run_id = '__RUN_ID__'
      AND (
        message.message_id IS NULL
        OR conversation.conversation_id IS NULL
        OR analysis_run.run_id IS NULL
      )
  )
) AS check_line;

SELECT CONCAT(
  'message_streams.stream_completed_without_run_completed=',
  (
    EXISTS(
      SELECT 1
      FROM message_streams
      WHERE run_id = '__RUN_ID__'
        AND event_type = 'stream.completed'
    )
    AND NOT EXISTS(
      SELECT 1
      FROM run_events
      WHERE run_id = '__RUN_ID__'
        AND event_type = 'run.completed'
    )
  )
) AS check_line;
