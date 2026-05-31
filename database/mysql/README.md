# MySQL 数据库目录

MySQL 8.x 是当前主数据库。

本目录承载数据库结构事实源和辅助材料：

- `migrations/`：SQL migration，数据库结构事实源。
- `seeds/`：初始化数据和演示数据 SQL。
- `queries/`：只读验证 SQL，用于 Navicat、smoke 和排障。
- `diagrams/`：ERD 或 Navicat 导出的结构图，仅辅助理解。

Navicat 是查看和验证工具，不是数据库结构事实源。禁止手工改表结构后再补 migration。
