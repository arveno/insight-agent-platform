# MySQL Migrations

本目录存放 MySQL SQL migration。

规则：

- migration 是数据库结构事实源。
- 每个 migration 文件必须入库、可审查、可追踪。
- Navicat 可以执行已审查 migration，不能手工改表结构。
- 新增真实业务表必须通过本目录 migration 入库。

当前已入库 migration：

```text
001_create_identity_workspace_foundation_tables.sql
003_create_metric_tables.sql
004_create_analysis_runtime_foundation_tables.sql
005_create_execution_attempts.sql
006_create_run_events.sql
007_create_runtime_artifacts.sql
008_create_context_source_reference_tables.sql
008_create_delivery_runtime_records.sql
009_backfill_analysis_tasks_conversation_id.sql
010_drop_legacy_conversations_analysis_task_id.sql
011_add_messages_analysis_task_id.sql
012_add_model_call_failure_metadata.sql
013_create_feedback_evaluation_tables.sql
```
