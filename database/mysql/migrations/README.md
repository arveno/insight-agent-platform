# MySQL Migrations

本目录存放 MySQL SQL migration。

规则：

- migration 是数据库结构事实源。
- 每个 migration 文件必须入库、可审查、可追踪。
- Navicat 可以执行已审查 migration，不能手工改表结构。
- 当前阶段不写真实业务表 SQL。

命名建议：

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
