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

INSERT INTO data_sources (
  data_source_id,
  workspace_id,
  source_type,
  name,
  created_at
) VALUES
(
  'data-source-china-revenue-warehouse',
  'workspace-northstar-retail-china',
  'mysql',
  'China Revenue Warehouse',
  '2026-05-19T09:00:00+08:00'
),
(
  'data-source-china-finance-mart',
  'workspace-northstar-retail-china',
  'clickhouse',
  'China Finance Mart',
  '2026-05-19T09:02:00+08:00'
),
(
  'data-source-china-operations-mart',
  'workspace-northstar-retail-china',
  'clickhouse',
  'China Operations Mart',
  '2026-05-19T09:04:00+08:00'
),
(
  'data-source-sea-operations-warehouse',
  'workspace-northstar-retail-sea',
  'mysql',
  'SEA Operations Warehouse',
  '2026-05-19T09:06:00+08:00'
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  source_type = VALUES(source_type),
  name = VALUES(name),
  created_at = VALUES(created_at);

INSERT INTO data_tables (
  table_id,
  data_source_id,
  table_name,
  created_at
) VALUES
(
  'table-sales-order',
  'data-source-china-revenue-warehouse',
  'sales_order',
  '2026-05-19T09:10:00+08:00'
),
(
  'table-income-statement-daily',
  'data-source-china-finance-mart',
  'income_statement_daily',
  '2026-05-19T09:12:00+08:00'
),
(
  'table-refund-order',
  'data-source-china-revenue-warehouse',
  'refund_order',
  '2026-05-19T09:16:00+08:00'
),
(
  'table-inventory-daily',
  'data-source-china-operations-mart',
  'inventory_daily_snapshot',
  '2026-05-19T09:18:00+08:00'
),
(
  'table-sea-sales-order',
  'data-source-sea-operations-warehouse',
  'sea_sales_order',
  '2026-05-19T09:20:00+08:00'
),
(
  'table-sea-delivery-fulfillment',
  'data-source-sea-operations-warehouse',
  'sea_delivery_fulfillment',
  '2026-05-19T09:22:00+08:00'
)
ON DUPLICATE KEY UPDATE
  data_source_id = VALUES(data_source_id),
  table_name = VALUES(table_name),
  created_at = VALUES(created_at);

INSERT INTO knowledge_documents (
  knowledge_document_id,
  workspace_id,
  title,
  created_at
) VALUES
(
  'knowledge-document-margin-review',
  'workspace-northstar-retail-china',
  '毛利率复盘纪要',
  '2026-05-27T18:00:00+08:00'
),
(
  'knowledge-document-inventory-east-04',
  'workspace-northstar-retail-china',
  '华东库存复核记录',
  '2026-05-29T14:00:00+08:00'
),
(
  'knowledge-document-channel-weekly-17',
  'workspace-northstar-retail-china',
  '渠道经营周报第 17 期',
  '2026-05-30T18:00:00+08:00'
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  title = VALUES(title),
  created_at = VALUES(created_at);

INSERT INTO metrics (
  metric_id,
  workspace_id,
  business_domain_id,
  name,
  description,
  current_value,
  unit,
  period,
  trend_direction,
  trend_value,
  status,
  risk_level,
  owner_team,
  formula_summary,
  threshold_summary,
  created_at,
  updated_at
) VALUES
(
  'metric-recognized-revenue',
  'workspace-northstar-retail-china',
  'business-domain-revenue-quality',
  '确认收入',
  '已满足确认条件的收入金额。',
  '¥12.8M',
  'CNY',
  'Last 30 days',
  'down',
  '-3.2%',
  'attention',
  'medium',
  'Revenue Operations',
  '确认收入 = 已预订收入 - 退款金额',
  '收入增速 < -2% 进入关注',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-gross-margin',
  'workspace-northstar-retail-china',
  'business-domain-margin-analysis',
  '毛利率',
  '收入扣除销售成本后保留的利润比例。',
  '33.4%',
  '%',
  'Last 30 days',
  'flat',
  '+0.0%',
  'healthy',
  'low',
  'Finance BP',
  '毛利率 = 毛利润 / 净收入',
  '毛利率 < 32% 进入关注',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-refund-rate',
  'workspace-northstar-retail-china',
  'business-domain-revenue-quality',
  '退款率',
  '已退款订单占已确认订单的比例。',
  '4.8%',
  '%',
  'Last 30 days',
  'up',
  '+0.9%',
  'attention',
  'medium',
  'Customer Care',
  '退款率 = 退款订单数 / 已确认订单数',
  '退款率 > 4.5% 进入关注',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-inventory-turnover',
  'workspace-northstar-retail-china',
  'business-domain-supply-chain-efficiency',
  '库存周转',
  '一定周期内库存消耗和补货效率的综合指标。',
  '5.1 turns',
  'turns',
  'Last 30 days',
  'down',
  '-0.4 turns',
  'attention',
  'high',
  'Supply Chain',
  '库存周转 = 销售成本 / 平均库存',
  '库存周转 < 5.3 turns 进入关注',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-sea-recognized-revenue',
  'workspace-northstar-retail-sea',
  'business-domain-revenue-quality',
  'SEA 确认收入',
  'SEA workspace 下已满足确认条件的收入金额。',
  '$4.3M',
  'USD',
  'Last 30 days',
  'down',
  '-1.6%',
  'attention',
  'medium',
  'SEA Revenue Operations',
  'SEA 确认收入 = 已预订收入 - 退款金额',
  '收入增速 < -1.5% 进入关注',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-sea-delivery-delay-rate',
  'workspace-northstar-retail-sea',
  'business-domain-delivery-operations',
  'SEA 配送延迟率',
  'SEA workspace 下配送延迟订单占比。',
  '6.2%',
  '%',
  'Last 30 days',
  'up',
  '+1.1%',
  'attention',
  'high',
  'SEA Fulfillment',
  '配送延迟率 = 延迟订单数 / 总配送订单数',
  '配送延迟率 > 5.5% 进入关注',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  business_domain_id = VALUES(business_domain_id),
  name = VALUES(name),
  description = VALUES(description),
  current_value = VALUES(current_value),
  unit = VALUES(unit),
  period = VALUES(period),
  trend_direction = VALUES(trend_direction),
  trend_value = VALUES(trend_value),
  status = VALUES(status),
  risk_level = VALUES(risk_level),
  owner_team = VALUES(owner_team),
  formula_summary = VALUES(formula_summary),
  threshold_summary = VALUES(threshold_summary),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

INSERT INTO metric_context_sources (
  metric_context_source_id,
  metric_id,
  source_type,
  source_id,
  role,
  title,
  summary,
  created_at,
  updated_at
) VALUES
(
  'metric-context-source-revenue-table',
  'metric-recognized-revenue',
  'dataTable',
  'table-sales-order',
  'primary_table',
  '销售订单汇总表',
  '作为确认收入的主表来源，按 workspace 粒度聚合已确认订单收入。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-revenue-report',
  'metric-recognized-revenue',
  'report',
  'report-weekly-business',
  'supporting_report',
  '周经营分析报告',
  '补充收入确认节奏、区域差异和渠道复核建议的只读摘要。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-margin-table',
  'metric-gross-margin',
  'dataTable',
  'table-income-statement-daily',
  'primary_table',
  '损益日表',
  '提供毛利润和净收入字段，用于解释毛利率波动。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-margin-document',
  'metric-gross-margin',
  'knowledgeDocument',
  'knowledge-document-margin-review',
  'supporting_document',
  '毛利率复盘纪要',
  '沉淀促销结构、成本结算和毛利波动解释的知识摘要。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-refund-table',
  'metric-refund-rate',
  'dataTable',
  'table-refund-order',
  'primary_table',
  '退款订单表',
  '提供退款订单明细和退款原因聚合口径。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-refund-evidence',
  'metric-refund-rate',
  'sourceEvidence',
  'source-evidence-refund-watch',
  'supporting_evidence',
  '退款异常证据摘要',
  '记录近期退款率抬升和客服标签聚合后的证据摘要。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-inventory-table',
  'metric-inventory-turnover',
  'dataTable',
  'table-inventory-daily',
  'primary_table',
  '库存日快照表',
  '提供平均库存和周转校验所需的日级快照摘要。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-inventory-document',
  'metric-inventory-turnover',
  'knowledgeDocument',
  'knowledge-document-inventory-east-04',
  'supporting_document',
  '华东库存复核记录',
  '补充促销库存错配和补货节奏异常的摘要说明。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-sea-revenue-table',
  'metric-sea-recognized-revenue',
  'dataTable',
  'table-sea-sales-order',
  'primary_table',
  'SEA 销售订单汇总表',
  '按 SEA workspace 聚合已确认订单收入，用于解释区域收入变化。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-sea-revenue-report',
  'metric-sea-recognized-revenue',
  'report',
  'report-sea-weekly-operations',
  'supporting_report',
  'SEA 周经营报告',
  '提供 SEA 区域渠道确认与交付节奏的补充摘要。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-sea-delay-table',
  'metric-sea-delivery-delay-rate',
  'dataTable',
  'table-sea-delivery-fulfillment',
  'primary_table',
  'SEA 履约配送表',
  '聚合延迟订单和履约 SLA 口径，用于解释延迟率波动。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
),
(
  'metric-context-source-sea-delay-evidence',
  'metric-sea-delivery-delay-rate',
  'sourceEvidence',
  'source-evidence-sea-delivery-delay',
  'supporting_evidence',
  'SEA 延迟异常证据摘要',
  '汇总港口拥堵、承运商履约异常和运营备注的证据摘要。',
  '2026-06-05T11:08:12+08:00',
  '2026-06-05T11:08:12+08:00'
)
ON DUPLICATE KEY UPDATE
  metric_id = VALUES(metric_id),
  source_type = VALUES(source_type),
  source_id = VALUES(source_id),
  role = VALUES(role),
  title = VALUES(title),
  summary = VALUES(summary),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);

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
    "version": 1,
    "suggestedPrompt": "请继续分析华东收入增速放缓的主要原因。",
    "traceability": "direct_refs",
    "capturedAt": "2026-06-05T03:08:12Z",
    "root": {
      "nodeId": "inspector-node-task-context-root",
      "kind": "dashboardOverview",
      "role": "inputContext",
      "owner": {
        "type": "analysisTask"
      },
      "title": "经营状态总览",
      "summary": "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
      "chips": ["Northstar Retail China", "Last 7 days", "3 条证据"],
      "timeRange": {
        "key": "last_7_days",
        "label": "Last 7 days"
      },
      "capturedAt": "2026-06-05T03:08:12Z",
      "children": [
        {
          "nodeId": "inspector-node-task-context-report",
          "kind": "report",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "周经营分析报告",
          "summary": "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
          "sourceRef": {
            "type": "report",
            "reportId": "report-weekly-business"
          }
        },
        {
          "nodeId": "inspector-node-task-context-metric",
          "kind": "metric",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "确认收入",
          "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
          "value": "收入增速 < -2%",
          "sourceRef": {
            "type": "metric",
            "metricId": "metric-recognized-revenue"
          },
          "children": [
            {
              "nodeId": "inspector-node-task-context-metric-source-1",
              "kind": "dataTable",
              "role": "inputContext",
              "owner": {
                "type": "analysisTask"
              },
              "title": "销售订单汇总表",
              "summary": "作为确认收入的主表来源。",
              "sourceRef": {
                "type": "dataTable",
                "tableId": "table-sales-order"
              }
            }
          ]
        }
      ]
    }
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
  'analysis-task-sea-delivery-delay',
  'conversation-sea-delivery-delay',
  'workspace-northstar-retail-sea',
  'user-zoe',
  'business-domain-delivery-operations',
  '解释 SEA 配送延迟率持续高位的主要原因，并给出下一步建议。',
  CAST('{
    "version": 1,
    "suggestedPrompt": "请继续分析 SEA 配送延迟率持续高位的主要原因。",
    "traceability": "direct_refs",
    "capturedAt": "2026-06-05T03:18:12Z",
    "root": {
      "nodeId": "inspector-node-task-context-sea-root",
      "kind": "dashboardOverview",
      "role": "inputContext",
      "owner": {
        "type": "analysisTask"
      },
      "title": "SEA 履约状态总览",
      "summary": "围绕 SEA 配送延迟率、区域履约波动和周经营报告继续追问。",
      "chips": ["Northstar Retail SEA", "Last 7 days", "2 条来源"],
      "timeRange": {
        "key": "last_7_days",
        "label": "Last 7 days"
      },
      "capturedAt": "2026-06-05T03:18:12Z",
      "children": [
        {
          "nodeId": "inspector-node-task-context-sea-report",
          "kind": "report",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "SEA 周经营报告",
          "summary": "围绕 SEA 渠道确认与履约延迟节奏继续追问。",
          "sourceRef": {
            "type": "report",
            "reportId": "report-sea-weekly-operations"
          }
        },
        {
          "nodeId": "inspector-node-task-context-sea-metric",
          "kind": "metric",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "SEA 配送延迟率",
          "summary": "SEA 区域配送延迟率持续高位，需要继续解释履约瓶颈和下一步建议。",
          "value": "配送延迟率 > 5.5% 进入关注",
          "sourceRef": {
            "type": "metric",
            "metricId": "metric-sea-delivery-delay-rate"
          },
          "children": [
            {
              "nodeId": "inspector-node-task-context-sea-metric-source-1",
              "kind": "dataTable",
              "role": "inputContext",
              "owner": {
                "type": "analysisTask"
              },
              "title": "SEA 履约配送表",
              "summary": "聚合延迟订单和履约 SLA 口径。",
              "sourceRef": {
                "type": "dataTable",
                "tableId": "table-sea-delivery-fulfillment"
              }
            }
          ]
        }
      ]
    }
  }' AS JSON),
  '2026-06-05T11:18:12+08:00',
  '2026-06-05T11:18:12+08:00'
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
  'conversation-sea-delivery-delay',
  'workspace-northstar-retail-sea',
  'user-zoe',
  'analysis-sea-delivery-delay',
  'SEA 配送延迟异常',
  'active',
  '2026-06-05T11:18:12+08:00',
  '2026-06-05T11:18:12+08:00'
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
  'analysis-sea-delivery-delay',
  'workspace-northstar-retail-sea',
  'user-zoe',
  'analysis-task-sea-delivery-delay',
  'created',
  'intake',
  NULL,
  NULL,
  '2026-06-05T11:18:12+08:00',
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

INSERT INTO source_evidence (
  source_evidence_id,
  run_id,
  source_type,
  source_id,
  title,
  snippet,
  metadata_json,
  confidence,
  created_at
) VALUES
(
  'source-evidence-refund-watch',
  'analysis-q2-revenue-gap',
  'data_table',
  'table-refund-order',
  '退款异常证据摘要',
  '记录近期退款率抬升和客服标签聚合后的证据摘要。',
  CAST('{"displayCategory":"refund_watch"}' AS JSON),
  0.84,
  '2026-06-05T11:12:12+08:00'
),
(
  'source-evidence-sea-delivery-delay',
  'analysis-sea-delivery-delay',
  'data_table',
  'table-sea-delivery-fulfillment',
  'SEA 延迟异常证据摘要',
  '汇总港口拥堵、承运商履约异常和运营备注的证据摘要。',
  CAST('{"displayCategory":"delivery_delay_watch"}' AS JSON),
  0.87,
  '2026-06-05T11:22:12+08:00'
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  source_type = VALUES(source_type),
  source_id = VALUES(source_id),
  title = VALUES(title),
  snippet = VALUES(snippet),
  metadata_json = VALUES(metadata_json),
  confidence = VALUES(confidence),
  created_at = VALUES(created_at);

INSERT INTO reports (
  report_id,
  run_id,
  workspace_id,
  title,
  summary,
  source_evidence_json,
  created_at
) VALUES
(
  'report-weekly-business',
  'analysis-q2-revenue-gap',
  'workspace-northstar-retail-china',
  '周经营分析报告',
  '围绕收入确认节奏、退款抬升和库存错配整理的周经营摘要。',
  CAST('["source-evidence-refund-watch"]' AS JSON),
  '2026-06-05T11:15:12+08:00'
),
(
  'report-sea-weekly-operations',
  'analysis-sea-delivery-delay',
  'workspace-northstar-retail-sea',
  'SEA 周经营报告',
  '围绕 SEA 区域渠道确认和履约延迟整理的周经营摘要。',
  CAST('["source-evidence-sea-delivery-delay"]' AS JSON),
  '2026-06-05T11:25:12+08:00'
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  workspace_id = VALUES(workspace_id),
  title = VALUES(title),
  summary = VALUES(summary),
  source_evidence_json = VALUES(source_evidence_json),
  created_at = VALUES(created_at);

INSERT INTO report_sections (
  report_section_id,
  report_id,
  title,
  content,
  created_at
) VALUES
(
  'report-section-weekly-business-next-step',
  'report-weekly-business',
  '下一步动作',
  '优先复核退款抬升原因和收入确认窗口，再检查库存错配是否影响确认节奏。',
  '2026-06-05T11:16:12+08:00'
),
(
  'report-section-sea-weekly-operations-next-step',
  'report-sea-weekly-operations',
  '下一步动作',
  '优先核对港口拥堵与承运商履约异常，再复核 SEA 配送 SLA 与延迟订单聚合口径。',
  '2026-06-05T11:26:12+08:00'
)
ON DUPLICATE KEY UPDATE
  report_id = VALUES(report_id),
  title = VALUES(title),
  content = VALUES(content),
  created_at = VALUES(created_at);
