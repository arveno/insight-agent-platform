INSERT INTO users (
  user_id,
  email,
  display_name,
  password_hash,
  created_at,
  updated_at
) VALUES (
  'user-zoe',
  'zoe@northstar.example.com',
  'Zoe',
  'pbkdf2_sha256$600000$seed-zoe-salt$7c7b38dc1ada2333ddd8a68c6cece3b1a435180355abbbcd0a5fc3b14ae036d2',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  display_name = VALUES(display_name),
  password_hash = VALUES(password_hash),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

INSERT INTO workspaces (
  workspace_id,
  name,
  created_at,
  updated_at
) VALUES
(
  'workspace-northstar-retail-china',
  'Northstar Retail China',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'workspace-northstar-retail-sea',
  'Northstar Retail SEA',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

INSERT INTO workspace_memberships (
  membership_id,
  user_id,
  workspace_id,
  role,
  created_at,
  updated_at
) VALUES
(
  'membership-user-zoe-northstar-retail-china',
  'user-zoe',
  'workspace-northstar-retail-china',
  'analyst',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'membership-user-zoe-northstar-retail-sea',
  'user-zoe',
  'workspace-northstar-retail-sea',
  'viewer',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  workspace_id = VALUES(workspace_id),
  role = VALUES(role),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

INSERT INTO auth_sessions (
  auth_session_id,
  user_id,
  current_workspace_id,
  session_token_hash,
  expires_at,
  created_at,
  updated_at,
  last_accessed_at,
  revoked_at
) VALUES (
  'auth-session-user-zoe-china',
  'user-zoe',
  'workspace-northstar-retail-china',
  '8c9f0fd0a44f0c2d6bc1f1b7a4a9f8f6d5d3ed4f6210c2b8fc6f0c58e5c74193',
  '2026-07-15T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00',
  NULL
)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  current_workspace_id = VALUES(current_workspace_id),
  session_token_hash = VALUES(session_token_hash),
  expires_at = VALUES(expires_at),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at),
  last_accessed_at = VALUES(last_accessed_at),
  revoked_at = VALUES(revoked_at);

INSERT INTO analysis_tasks (
  analysis_task_id,
  conversation_id,
  workspace_id,
  user_id,
  business_domain_id,
  question,
  context_pack_json,
  created_at,
  updated_at
) VALUES (
  'analysis-task-revenue-gap-q2',
  'conversation-revenue-gap-q2',
  'workspace-northstar-retail-china',
  'user-zoe',
  'business-domain-revenue-quality',
  '解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。',
  CAST('{
    "metricId": "metric-recognized-revenue",
    "timeRange": "2026 Q2",
    "threshold": "收入增速 < -2%",
    "trend": "华东区域收入增速低于阈值",
    "tableIds": ["table-sales-order", "table-refund-order"],
    "knowledgeDocumentIds": [
      "knowledge-document-channel-weekly-17",
      "knowledge-document-inventory-east-04"
    ]
  }' AS JSON),
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  conversation_id = VALUES(conversation_id),
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  business_domain_id = VALUES(business_domain_id),
  question = VALUES(question),
  context_pack_json = VALUES(context_pack_json),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

INSERT INTO conversations (
  conversation_id,
  workspace_id,
  user_id,
  current_run_id,
  title,
  status,
  created_at,
  updated_at
) VALUES (
  'conversation-revenue-gap-q2',
  'workspace-northstar-retail-china',
  'user-zoe',
  'analysis-q2-revenue-gap',
  '收入增速异常',
  'active',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  current_run_id = VALUES(current_run_id),
  title = VALUES(title),
  status = VALUES(status),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

INSERT INTO analysis_runs (
  run_id,
  workspace_id,
  user_id,
  analysis_task_id,
  status,
  phase,
  outcome,
  waiting_for,
  created_at,
  validating_at,
  queued_at,
  started_at,
  waiting_since,
  timeout_at,
  cancel_requested_at,
  cancelling_at,
  completed_at,
  failed_at,
  cancelled_at,
  expired_at,
  rejected_at,
  terminal_reason,
  failure_code,
  retryable,
  retry_of_run_id,
  original_run_id
) VALUES (
  'analysis-q2-revenue-gap',
  'workspace-northstar-retail-china',
  'user-zoe',
  'analysis-task-revenue-gap-q2',
  'created',
  'intake',
  NULL,
  NULL,
  '2026-06-05T11:08:12+08:00',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  analysis_task_id = VALUES(analysis_task_id),
  status = VALUES(status),
  phase = VALUES(phase),
  outcome = VALUES(outcome),
  waiting_for = VALUES(waiting_for),
  created_at = VALUES(created_at),
  validating_at = VALUES(validating_at),
  queued_at = VALUES(queued_at),
  started_at = VALUES(started_at),
  waiting_since = VALUES(waiting_since),
  timeout_at = VALUES(timeout_at),
  cancel_requested_at = VALUES(cancel_requested_at),
  cancelling_at = VALUES(cancelling_at),
  completed_at = VALUES(completed_at),
  failed_at = VALUES(failed_at),
  cancelled_at = VALUES(cancelled_at),
  expired_at = VALUES(expired_at),
  rejected_at = VALUES(rejected_at),
  terminal_reason = VALUES(terminal_reason),
  failure_code = VALUES(failure_code),
  retryable = VALUES(retryable),
  retry_of_run_id = VALUES(retry_of_run_id),
  original_run_id = VALUES(original_run_id);
