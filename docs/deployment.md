# Deployment

本文档是部署、环境变量、Smoke Test、回滚和排障的事实源。

## 1. 部署目标

项目采用：

- Frontend：静态资源部署。
- Agent Runtime：Python / FastAPI / LangGraph，Docker 化后部署到 CloudBase Run。
- Database：MySQL 8.x，通过 repository 层隔离。
- Vector Store：Milvus。
- Cache / Queue：Redis。

当前主部署链路是 CloudBase Run + Docker。CloudBase Functions 不作为当前主部署链路，不建立 CloudBase Functions 与 CloudBase Run 双部署主线。

`#155` 的云端 Preview 优先策略、可重置 preview 边界和本地基础设施压缩边界以 `docs/runtime-capability-coverage.md` 为准。

前端部署方向是静态资源 / EdgeOne Pages 或腾讯云静态托管。

## 2. 环境变量

环境变量必须集中管理，不允许散落读取。

后端配置入口：

```text
services/agent-runtime/src/app/config.py
```

`services/agent-runtime/src/**` 下的 Python runtime package 目录必须使用 snake_case；contracts、docs 和前端 route 不受这条命名规则约束。

前端只能使用浏览器可见配置，不允许暴露模型密钥、数据库连接串、向量库密钥。

## 3. 必备环境变量占位

```text
APP_ENV=
DATABASE_URL=
REDIS_URL=
MILVUS_URI=
MODEL_GATEWAY_DEFAULT_PROVIDER=
QWEN_API_KEY=
DEEPSEEK_API_KEY=
ZHIPU_API_KEY=
SILICONFLOW_API_KEY=
LANGSMITH_API_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
```

## 4. Docker

Docker 配置放在：

```text
deploy/docker/
```

Agent Runtime 必须可以通过 Docker 启动。

## 5. CloudBase Run

CloudBase Run 部署配置放在：

```text
deploy/cloudbase-run/
```

CloudBase 仅作为部署平台 / 云资源选项，不作为 Agent Runtime 架构核心。

CloudBase Functions 不作为当前主部署链路。

## 6. 数据库迁移

数据库迁移必须使用仓库内 SQL migration 管理。

迁移事实源：

```text
database/mysql/migrations/
```

Navicat 可以执行已审查 migration，但不能手工修改生产数据库结构而不记录迁移。

## 7. Seed 数据

演示数据通过 seed SQL 创建。

Seed 事实源：

```text
database/mysql/seeds/
```

允许：

- seed demo workspace
- seed demo metrics
- seed demo documents
- seed demo analysis runs

禁止：

- Mock / Real 模式切换。
- 业务代码中硬编码 mock 数据。

## 8. Smoke Test

Smoke Test 放在：

```text
scripts/smoke/
```

至少覆盖：

- `/health`
- 创建 workspace
- 创建 analysis task
- 创建 analysis run
- SSE / run events 基础链路
- contract response check

## 9. Load Test

Load Test 放在：

```text
scripts/load/
```

V1 可占位，后续覆盖：

- model latency
- tool latency
- RAG retrieval latency
- P95 / P99
- error rate
- cache hit rate

## 10. Failure Simulation

Failure Simulation 放在：

```text
scripts/failure-simulation/
```

必须逐步覆盖：

- model provider failure
- vector store failure
- sql guard rejection
- tool timeout
- RAG no source
- memory unavailable
- evaluation failure
- SSE disconnect

## 11. 回滚与排障

部署文档必须能说明：

- 如何查看 runtime 日志。
- 如何检查环境变量。
- 如何检查数据库连接。
- 如何检查模型 provider。
- 如何回滚容器版本。
- 如何运行 smoke test。

## 12. CI / CD

CI 初始阶段只做守门，不自动部署生产。

后续自动部署必须通过已审查 Issue 逐步实现，但目录和职责现在已经固定。

## 13. 部署自动化分层

最终部署自动化分层固定为：

```text
build -> package -> deploy -> smoke -> rollback
```

承载位：

- `scripts/build/`
- `scripts/package/`
- `scripts/deploy/`
- `scripts/smoke/`
- `scripts/rollback/`

部署前质量门禁必须逐步纳入：

```text
verify -> build -> package -> smoke -> security
```

CI 当前仍可只做结构守门，不自动部署生产；但命令入口已经固定，后续 Issue 只能在既有入口内替换真实实现。

## 14. 数据库自动化

数据库自动化链路固定为：

```text
migration -> seed -> query verify
```

承载位：

- `scripts/migration/`
- `database/mysql/migrations/`
- `database/mysql/seeds/`
- `database/mysql/queries/`

## 15. 安全检查

安全检查入口固定为：

```text
security check
```

承载位：

```text
scripts/security/
```

后续承载密钥泄露检查、SQL Guard、Tool Permission、敏感字段和依赖安全检查。
