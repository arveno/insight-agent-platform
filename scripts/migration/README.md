# Migration Scripts

数据库 migration / seed 执行入口。

执行对象只能来自：

- `database/mysql/migrations`
- `database/mysql/seeds`

禁止执行未入库、未审查 SQL。Navicat 可以辅助执行已审查 SQL，但不能替代仓库事实源。

## `runtime_foundation.sh`

`scripts/migration/runtime_foundation.sh` 当前默认目标是 `ECS preview MySQL`：

- 默认 `IAP_MIGRATION_TARGET=ecs`
- 默认通过 `ssh iap-ecs` 连接 ECS
- 默认使用 ECS 上的 `/opt/insight-agent-platform/env/ecs-preview.env`
- 默认使用 ECS 上的 `/opt/insight-agent-platform/deploy/docker/compose.ecs.preview.yml`
- 默认在 ECS 的 `mysql` container 内执行 `migration / seed / query verify / exec-sql / query-json`

本地 MySQL 只保留为显式 `local dev adapter`，必须手工指定：

```bash
IAP_MIGRATION_TARGET=local ./scripts/migration/runtime_foundation.sh migrate
```

`local` 模式会启动本地 compose `mysql` service，并生成本地数据目录：

```text
.tmp/runtime-foundation/mysql/**
```

`down` 仅允许在 `IAP_MIGRATION_TARGET=local` 下使用，避免误操作 ECS preview 基础栈。

## `runtime_execution_verify.sh`

`scripts/migration/runtime_execution_verify.sh` 是 `#240` 的 run-scoped query verify。

- 读取 `database/mysql/queries/005_analysis_runtime_execution_verify.sql`
- 要求显式提供 `runId`
- 复用 `runtime_foundation.sh query-json` 的目标选择逻辑

示例：

```bash
IAP_MIGRATION_TARGET=local IAP_RUNTIME_VERIFY_RUN_ID=<runId> ./scripts/migration/runtime_execution_verify.sh
```
