SELECT CONCAT('runId=', run_id) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.status=', status) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.phase=', phase) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.failureCode=', COALESCE(failure_code, 'NULL')) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('model_calls.failed.row_count=', COUNT(*)) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
  AND status = 'failed';

SELECT CONCAT('provider=', provider) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('model=', model_id) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('modelCall.status=', status) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('failureClass=', COALESCE(failure_class, 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('errorType=', COALESCE(error_type, 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('safeErrorMessage=', COALESCE(error_message, 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('httpStatus=', COALESCE(CAST(http_status AS CHAR), 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('providerErrorCode=', COALESCE(provider_error_code, 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('providerRequestId=', COALESCE(provider_request_id, 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('latencyMs=', latency_ms) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('timeoutMs=', COALESCE(CAST(timeout_ms AS CHAR), 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('retryable=', COALESCE(CAST(retryable AS CHAR), 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('retryAfterMs=', COALESCE(CAST(retry_after_ms AS CHAR), 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT('rawErrorRedacted=', COALESCE(raw_error_redacted, 'NULL')) AS check_line
FROM model_calls
WHERE run_id = '__RUN_ID__'
ORDER BY started_at ASC, id ASC
LIMIT 1;

SELECT CONCAT(
  'run_events.model_call.failed.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'model_call.failed'
  )
) AS check_line;

SELECT CONCAT('run_events.model_call.failed.errorCode=', COALESCE(error_code, 'NULL')) AS check_line
FROM run_events
WHERE run_id = '__RUN_ID__'
  AND event_type = 'model_call.failed'
ORDER BY sequence DESC, id DESC
LIMIT 1;

SELECT CONCAT(
  'run_events.model_call.failed.errorMessage=',
  COALESCE(error_message, 'NULL')
) AS check_line
FROM run_events
WHERE run_id = '__RUN_ID__'
  AND event_type = 'model_call.failed'
ORDER BY sequence DESC, id DESC
LIMIT 1;

SELECT CONCAT(
  'run_events.run.failed.exists=',
  EXISTS(
    SELECT 1
    FROM run_events
    WHERE run_id = '__RUN_ID__'
      AND event_type = 'run.failed'
  )
) AS check_line;

SELECT CONCAT('run_events.run.failed.errorCode=', COALESCE(error_code, 'NULL')) AS check_line
FROM run_events
WHERE run_id = '__RUN_ID__'
  AND event_type = 'run.failed'
ORDER BY sequence DESC, id DESC
LIMIT 1;

SELECT CONCAT('run_events.run.failed.errorMessage=', COALESCE(error_message, 'NULL')) AS check_line
FROM run_events
WHERE run_id = '__RUN_ID__'
  AND event_type = 'run.failed'
ORDER BY sequence DESC, id DESC
LIMIT 1;

SELECT CONCAT(
  'secrets.authorization.exposed=',
  EXISTS(
    SELECT 1
    FROM model_calls
    WHERE run_id = '__RUN_ID__'
      AND (
        COALESCE(error_message, '') LIKE '%Authorization%'
        OR COALESCE(error_message, '') LIKE '%Bearer %'
        OR COALESCE(raw_error_redacted, '') LIKE '%Authorization%'
        OR COALESCE(raw_error_redacted, '') LIKE '%Bearer %'
      )
  )
) AS check_line;
