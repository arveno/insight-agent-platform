# 数据库事实源

## 1. 目标

本文件是 MySQL 数据库结构、字段命名、迁移、Seed、Navicat 使用边界和表关系设计的事实源。

数据库结构只能从仓库内可审查文件演进，不能从本地工具或口头约定反推。

## 2. 数据库主线

- 当前主数据库是 MySQL 8.x。
- 当前不建立 MySQL / PostgreSQL 双主线。
- 数据库结构以仓库内 SQL migration 为事实源。
- Navicat 只能作为查看、验证和执行已审查 SQL 的工具。

## 3. Navicat 使用边界

Navicat 允许用于：

- 查看表结构。
- 查看字段。
- 查看索引。
- 查看数据。
- 执行仓库中已审查过的 migration / seed / query SQL。
- 验证 migration / seed 执行结果。
- 导出 ERD 或结构截图用于理解。

Navicat 禁止用于：

- 手工改表结构。
- 手工新增字段。
- 手工删除字段。
- 手工修改索引。
- 手工修改生产数据。
- 执行未入库、未审查 SQL。
- 把 Navicat 中的结构当成事实源。

Navicat 是查看和验证工具，不是数据库结构事实源。

## 4. 命名规则

- MySQL 表名使用 snake_case，建议复数形式。
- MySQL 字段名使用 snake_case。
- contracts / API / 前端字段使用 camelCase。
- DB 到 API 的字段转换只允许发生在 repository / schema / mapper 明确边界。
- UI 不允许接触 snake_case 数据库字段。

## 5. 主键与业务 ID 规则

- 每张业务表使用 `id BIGINT AUTO_INCREMENT` 作为物理主键。
- 跨系统、跨层链路使用业务 ID 字段，例如 `workspace_id`、`run_id`、`tool_call_id`。
- contracts 中对应为 `workspaceId`、`runId`、`toolCallId`。
- 时间字段统一为 `created_at`、`updated_at`、可选 `deleted_at`。
- 状态字段统一为 `status`。
- JSON 字段使用 `_json` 后缀，例如 `metadata_json`、`input_json`、`output_json`、`config_json`。

## 6. 字段转换链路

```text
DB row / ORM model
-> Repository Mapper
-> Domain Model
-> Contract Model
-> Frontend ViewModel
-> UI
```

禁止：

- UI 直接处理 `workspace_id`。
- 组件里写 `created_at || createdAt`。
- 多个 service 各自转换字段。
- 数据库字段泄漏到 contracts / 前端。

## 7. Migration 规则

当前主迁移方式：

- 仓库内 SQL migration。
- 每个 migration 文件必须入库、可审查、可追踪。
- Navicat 可以执行已审查 migration，但不能手工改表结构。

### 当前 L3 runtime foundation reset/rebuild policy

- 当前 L3 runtime foundation 阶段采用 reset/rebuild migration policy。
- local / preview runtime foundation 数据允许清空重建。
- canonical schema 以当前 `migration + seed + query verify` 链路为准。
- 本阶段不承诺从旧 runtime foundation 表结构做 in-place upgrade。

Migration 命名建议：

```text
001_create_workspace_tables.sql
002_create_data_knowledge_tables.sql
003_create_metric_tables.sql
004_create_analysis_runtime_tables.sql
005_create_memory_tables.sql
006_create_feedback_tables.sql
007_create_evaluation_tables.sql
008_create_model_tool_tables.sql
009_create_governance_tables.sql
010_create_report_decision_tables.sql
011_create_platform_operation_tables.sql
```

## 8. Seed / Query / Diagram 规则

- `database/mysql/seeds` 存放初始化数据和演示数据 SQL。
- `database/mysql/queries` 存放只读验证 SQL，用于 Navicat、smoke、排障。
- `database/mysql/diagrams` 存放 ERD 或 Navicat 导出的结构图，仅辅助理解，不作为结构事实源。

## 9. 数据库业务域与表关系路线

本节只定义路线，不实现真实 SQL 表。

当前 `#154` 只收口数据库对象路线和命名边界，不创建真实 migration、repository 或 persistence 实现。

后续真实落库、migration、repository 和查询实现由 `#155 runtime: AnalysisRun 真实业务接入与企业级运行硬化` 承接。

但从本节开始列出的对象路线，已经视为当前正式 runtime / reports / feedback / evaluation 的目标落库路线；后续实现不应再回头讨论这些对象“是否应该落库”。

### Workspace / IAM

表：

```text
workspaces
users
workspace_members
roles
permissions
role_permissions
business_domains
```

关系：

```text
workspace 1 - n workspace_members
user 1 - n workspace_members
workspace_member n - 1 role
role n - n permissions，通过 role_permissions 关联
workspace 1 - n business_domains
```

### Data & Knowledge

表：

```text
data_sources
data_tables
data_fields
knowledge_documents
knowledge_chunks
source_evidence
```

关系：

```text
workspace 1 - n data_sources
data_source 1 - n data_tables
data_table 1 - n data_fields
workspace 1 - n knowledge_documents
knowledge_document 1 - n knowledge_chunks
analysis_run 1 - n source_evidence
source_evidence 可引用 data_table / metric / knowledge_chunk / sql_query / memory
```

### Metrics

表：

```text
metrics
metric_formulas
metric_thresholds
metric_lineage
```

关系：

```text
workspace 1 - n metrics
business_domain 1 - n metrics
metric 1 - n metric_formulas
metric 1 - n metric_thresholds
metric n - n data_fields / data_tables，通过 metric_lineage 关联
```

### Analysis Runtime

表：

```text
analysis_tasks
analysis_runs
conversations
messages
message_streams
run_events
tool_calls
model_calls
source_evidence
execution_attempts
approval_requests
reports
report_sections
decisions
action_suggestions
feedback
evaluation_runs
evaluation_scores
bad_cases
```

关系：

```text
workspace 1 - n analysis_tasks
workspace 1 - n conversations
conversation 1 - n analysis_tasks
analysis_task 1 - n analysis_runs
analysis_task 1 - n messages
analysis_run 1 - n messages
conversation 1 - n messages
conversation.current_run_id -> analysis_runs.run_id
message 1 - n message_streams
analysis_run 1 - n run_events
analysis_run 1 - n tool_calls
analysis_run 1 - n model_calls
analysis_run 1 - n source_evidence
analysis_run 1 - n execution_attempts
analysis_run 1 - n approval_requests
analysis_run 1 - n reports
analysis_run 1 - n decisions
analysis_run 1 - n feedback
analysis_run 1 - n evaluation_runs
analysis_run 1 - n bad_cases
report 1 - n report_sections
decision 1 - n action_suggestions
evaluation_run 1 - n evaluation_scores
feedback 0..n bad_cases
```

关键业务 ID 路线至少包括：

```text
analysis_tasks.analysis_task_id
analysis_tasks.conversation_id
analysis_runs.run_id
conversations.conversation_id
conversations.current_run_id
messages.message_id
messages.conversation_id
messages.analysis_task_id
messages.turn_id
messages.run_id
message_streams.message_stream_id
message_streams.message_id
message_streams.run_id
run_events.event_id
run_events.run_id
execution_attempts.attempt_id
execution_attempts.run_id
approval_requests.approval_id
approval_requests.run_id
reports.report_id
reports.run_id
report_sections.report_id
decisions.decision_id
decisions.run_id
decisions.report_id
action_suggestions.action_suggestion_id
action_suggestions.decision_id
feedback.feedback_id
feedback.run_id
feedback.report_id
evaluation_runs.evaluation_run_id
evaluation_runs.run_id
evaluation_scores.evaluation_score_id
evaluation_scores.evaluation_run_id
bad_cases.bad_case_id
bad_cases.run_id
```

说明：

- `run_id` 是一次 runtime 执行链路的核心业务 ID。
- `conversation_id` 是 Analysis 工作区会话主线的核心业务 ID。
- `message_id / turn_id / message_stream_id` 承接会话消息和流式输出链路，不替代 `run_id`。
- `event_id` 是 run 内部事件 ID。
- `tool_call_id` / `model_call_id` / `attempt_id` / `approval_id` 都必须围绕 `run_id` 归属。
- 当前 PR 不创建这些表；这里只冻结目标落库路线，供后续 migration / repository 实现直接对齐 contracts。

### Memory

表：

```text
memory_items
```

关系：

```text
workspace 1 - n memory_items
memory_items 可关联 user / workspace / analysis_run / decision
```

### Feedback

表：

```text
feedback
```

关系：

```text
analysis_run 1 - n feedback
feedback.report_id -> reports.report_id
feedback 可关联 source_evidence / action_suggestion
```

### Evaluation

表：

```text
bad_cases
evaluation_datasets
evaluation_runs
evaluation_scores
```

关系：

```text
evaluation_dataset 1 - n evaluation_runs
evaluation_run 1 - n evaluation_scores
analysis_run 1 - n evaluation_runs
feedback 0..n bad_cases
bad_case.run_id -> analysis_runs.run_id
```

Memory 不等于 Feedback，Feedback 不等于 Evaluation，BadCase 是 Feedback / Evaluation 后沉淀出来的问题样本。

### Model / Tool / RAG

表：

```text
model_configs
routing_policies
prompt_versions
tool_definitions
rag_strategies
```

关系：

```text
workspace 1 - n model_configs
workspace 1 - n routing_policies
workspace 1 - n prompt_versions
workspace 1 - n tool_definitions
workspace 1 - n rag_strategies
analysis_run 记录使用的 model_config / prompt_version / rag_strategy / tool_definition 版本信息
```

### Governance

表：

```text
permission_policies
risk_rules
audit_logs
```

关系：

```text
workspace 1 - n permission_policies
workspace 1 - n risk_rules
workspace 1 - n audit_logs
audit_log 可关联 user / run / tool_call / model_call / report / decision
```

### Reports / Decisions

表：

```text
reports
report_sections
decisions
action_suggestions
```

关系：

```text
analysis_run 1 - 1 report
report 1 - n report_sections
analysis_run 1 - n decisions
report 0..n decisions
decision 1 - n action_suggestions
decision.report_id -> reports.report_id
decision.run_id -> analysis_runs.run_id
```

### Platform Operations

表：

```text
jobs
notifications
data_quality_checks
```

关系：

```text
workspace 1 - n jobs
job 可关联 ingestion / evaluation / report / deployment / data_quality_check
workspace 1 - n notifications
workspace 1 - n data_quality_checks
data_quality_check 可关联 data_source / data_table / metric
```

## 10. 禁止项

- 禁止手工改数据库结构后再补 migration。
- 禁止让 Navicat 成为结构事实源。
- 禁止数据库字段直接进入 UI。
- 禁止同一字段出现 snake_case / camelCase 多处兜底。
- 禁止绕过 repository 直接访问数据库。
- 禁止未经 Issue 审查直接执行 SQL。
