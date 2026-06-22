SELECT CONCAT('runId=', run_id) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.status=', status) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('analysisRun.phase=', phase) AS check_line
FROM analysis_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT('feedback.run.row_count=', COUNT(*)) AS check_line
FROM feedback
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'feedback.report_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM feedback feedback_record
    LEFT JOIN reports report
      ON report.report_id = feedback_record.report_id
     AND report.run_id = feedback_record.run_id
    WHERE feedback_record.run_id = '__RUN_ID__'
      AND report.report_id IS NULL
  )
) AS check_line;

SELECT CONCAT(
  'feedback.workspace_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM feedback feedback_record
    LEFT JOIN analysis_runs analysis_run
      ON analysis_run.run_id = feedback_record.run_id
     AND analysis_run.workspace_id = feedback_record.workspace_id
    WHERE feedback_record.run_id = '__RUN_ID__'
      AND analysis_run.run_id IS NULL
  )
) AS check_line;

SELECT CONCAT('evaluation_runs.run.row_count=', COUNT(*)) AS check_line
FROM evaluation_runs
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'evaluation_runs.status.needs_review.exists=',
  EXISTS(
    SELECT 1
    FROM evaluation_runs
    WHERE run_id = '__RUN_ID__'
      AND status = 'needs_review'
  )
) AS check_line;

SELECT CONCAT(
  'evaluation_runs.dataset_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM evaluation_runs evaluation_run
    LEFT JOIN evaluation_datasets dataset
      ON dataset.dataset_id = evaluation_run.dataset_id
     AND dataset.workspace_id = evaluation_run.workspace_id
    WHERE evaluation_run.run_id = '__RUN_ID__'
      AND dataset.dataset_id IS NULL
  )
) AS check_line;

SELECT CONCAT('bad_cases.run.row_count=', COUNT(*)) AS check_line
FROM bad_cases
WHERE run_id = '__RUN_ID__';

SELECT CONCAT(
  'bad_cases.feedback_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM bad_cases bad_case
    LEFT JOIN feedback feedback_record
      ON feedback_record.feedback_id = bad_case.feedback_id
     AND feedback_record.run_id = bad_case.run_id
    WHERE bad_case.run_id = '__RUN_ID__'
      AND bad_case.feedback_id IS NOT NULL
      AND feedback_record.feedback_id IS NULL
  )
) AS check_line;

SELECT CONCAT(
  'bad_cases.evaluation_run_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM bad_cases bad_case
    LEFT JOIN evaluation_runs evaluation_run
      ON evaluation_run.evaluation_run_id = bad_case.evaluation_run_id
     AND evaluation_run.run_id = bad_case.run_id
    WHERE bad_case.run_id = '__RUN_ID__'
      AND bad_case.evaluation_run_id IS NOT NULL
      AND evaluation_run.evaluation_run_id IS NULL
  )
) AS check_line;

SELECT CONCAT(
  'feedback.negative.bad_case_link.exists=',
  NOT EXISTS(
    SELECT 1
    FROM feedback feedback_record
    LEFT JOIN bad_cases bad_case
      ON bad_case.feedback_id = feedback_record.feedback_id
     AND bad_case.run_id = feedback_record.run_id
    WHERE feedback_record.run_id = '__RUN_ID__'
      AND feedback_record.feedback_type IN (
        'not_useful',
        'incorrect',
        'sql_error',
        'source_insufficient',
        'analysis_shallow',
        'suggestion_unusable',
        'manual_correction'
      )
      AND bad_case.bad_case_id IS NULL
  )
) AS check_line;
