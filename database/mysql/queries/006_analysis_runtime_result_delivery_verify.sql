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
      AND outcome = 'success'
  )
) AS check_line;

SELECT CONCAT('tool_calls.run.row_count=', COUNT(*)) AS check_line
FROM tool_calls
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('tool_calls.succeeded.row_count=', COUNT(*)) AS check_line
FROM tool_calls
WHERE run_id = '__RUN_ID__'
  AND status = 'succeeded';

SELECT CONCAT('model_calls.run.row_count=', COUNT(*)) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('model_calls.succeeded.row_count=', COUNT(*)) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
  AND status = 'succeeded';

SELECT CONCAT('source_evidence.run.row_count=', COUNT(*)) AS check_line
FROM source_evidence
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('reports.run.row_count=', COUNT(*)) AS check_line
FROM reports
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('report_sections.run.row_count=', COUNT(*)) AS check_line
FROM report_sections
WHERE report_id IN (
  SELECT report_id
  FROM reports
  WHERE run_id = '__RUN_ID__'
);

SELECT CONCAT('decisions.run.row_count=', COUNT(*)) AS check_line
FROM decisions
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'decisions.report_link.exists=',
  EXISTS(
    SELECT 1
    FROM decisions decision
    INNER JOIN reports report
      ON report.report_id = decision.report_id
     AND report.run_id = decision.run_id
    WHERE decision.run_id = '__RUN_ID__'
  )
) AS check_line;

SELECT CONCAT('messages.assistant.run.row_count=', COUNT(*)) AS check_line
FROM messages
WHERE run_id = '__RUN_ID__'
  AND role = 'assistant';

SELECT CONCAT(
  'messages.assistant.report_link.exists=',
  EXISTS(
    SELECT 1
    FROM messages message
    INNER JOIN reports report
      ON report.report_id = message.report_id
     AND report.run_id = message.run_id
    WHERE message.run_id = '__RUN_ID__'
      AND message.role = 'assistant'
  )
) AS check_line;

SELECT CONCAT(
  'messages.assistant.turn.reused=',
  EXISTS(
    SELECT 1
    FROM messages assistant
    INNER JOIN messages user_message
      ON user_message.conversation_id = assistant.conversation_id
     AND user_message.analysis_task_id = assistant.analysis_task_id
     AND user_message.run_id = assistant.run_id
     AND user_message.turn_id = assistant.turn_id
     AND user_message.role = 'user'
    WHERE assistant.run_id = '__RUN_ID__'
      AND assistant.role = 'assistant'
  )
) AS check_line;

SELECT CONCAT(
  'messages.assistant.source_evidence.non_empty=',
  (
    EXISTS(
      SELECT 1
      FROM messages
      WHERE run_id = '__RUN_ID__'
        AND role = 'assistant'
    )
    AND NOT EXISTS(
      SELECT 1
      FROM messages
      WHERE run_id = '__RUN_ID__'
        AND role = 'assistant'
        AND COALESCE(JSON_LENGTH(source_evidence_ids_json), 0) = 0
    )
  )
) AS check_line;

SELECT CONCAT(
  'messages.assistant.source_evidence.linkage.valid=',
  NOT EXISTS(
    SELECT 1
    FROM messages message
    INNER JOIN JSON_TABLE(
      message.source_evidence_ids_json,
      '$[*]' COLUMNS (
        source_evidence_id VARCHAR(255) PATH '$'
      )
    ) message_source
      ON TRUE
    LEFT JOIN source_evidence evidence
      ON evidence.source_evidence_id = message_source.source_evidence_id
     AND evidence.run_id = message.run_id
    WHERE message.run_id = '__RUN_ID__'
      AND message.role = 'assistant'
      AND evidence.source_evidence_id IS NULL
  )
) AS check_line;

SELECT CONCAT(
  'reports.source_evidence.non_empty=',
  (
    EXISTS(
      SELECT 1
      FROM reports
      WHERE run_id = '__RUN_ID__'
    )
    AND NOT EXISTS(
      SELECT 1
      FROM reports
      WHERE run_id = '__RUN_ID__'
        AND COALESCE(JSON_LENGTH(source_evidence_json), 0) = 0
    )
  )
) AS check_line;

SELECT CONCAT(
  'reports.source_evidence.linkage.valid=',
  NOT EXISTS(
    SELECT 1
    FROM reports report
    INNER JOIN JSON_TABLE(
      report.source_evidence_json,
      '$[*]' COLUMNS (
        source_evidence_id VARCHAR(255) PATH '$'
      )
    ) report_source
      ON TRUE
    LEFT JOIN source_evidence evidence
      ON evidence.source_evidence_id = report_source.source_evidence_id
     AND evidence.run_id = report.run_id
    WHERE report.run_id = '__RUN_ID__'
      AND evidence.source_evidence_id IS NULL
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

SELECT CONCAT(
  'run_events.verification.started.before.verification.passed=',
  EXISTS(
    SELECT 1
    FROM run_events verification_started
    INNER JOIN run_events verification_passed
      ON verification_passed.run_id = verification_started.run_id
    WHERE verification_started.run_id = '__RUN_ID__'
      AND verification_started.event_type = 'verification.started'
      AND verification_passed.event_type = 'verification.passed'
      AND verification_started.sequence < verification_passed.sequence
  )
) AS check_line;

SELECT CONCAT(
  'run_events.verification.passed.before.delivery.started=',
  EXISTS(
    SELECT 1
    FROM run_events verification_passed
    INNER JOIN run_events delivery_started
      ON delivery_started.run_id = verification_passed.run_id
    WHERE verification_passed.run_id = '__RUN_ID__'
      AND verification_passed.event_type = 'verification.passed'
      AND delivery_started.event_type = 'delivery.started'
      AND verification_passed.sequence < delivery_started.sequence
  )
) AS check_line;

SELECT CONCAT(
  'run_events.delivery.started.before.artifact.persisted=',
  EXISTS(
    SELECT 1
    FROM run_events delivery_started
    INNER JOIN run_events artifact_event
      ON artifact_event.run_id = delivery_started.run_id
    WHERE delivery_started.run_id = '__RUN_ID__'
      AND delivery_started.event_type = 'delivery.started'
      AND artifact_event.event_type = 'artifact.persisted'
      AND delivery_started.sequence < artifact_event.sequence
  )
) AS check_line;

SELECT CONCAT(
  'run_events.artifact.persisted.before.run.completed=',
  EXISTS(
    SELECT 1
    FROM run_events artifact_event
    INNER JOIN run_events completed_event
      ON completed_event.run_id = artifact_event.run_id
    WHERE artifact_event.run_id = '__RUN_ID__'
      AND artifact_event.event_type = 'artifact.persisted'
      AND completed_event.event_type = 'run.completed'
      AND artifact_event.sequence < completed_event.sequence
  )
) AS check_line;
