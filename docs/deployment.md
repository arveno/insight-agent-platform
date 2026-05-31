# Deployment

本文档是部署、环境变量、Smoke Test、回滚和排障的事实源。

## 1. 部署目标

项目采用：

- Frontend：静态资源部署。
- Agent Runtime：Python / FastAPI / LangGraph，Docker 化后部署到 CloudBase Run。
- Database：CloudBase MySQL 或 PostgreSQL，通过 repository 层隔离。
- Vector Store：Milvus。
- Cache / Queue：Redis。

## 2. 环境变量

环境变量必须集中管理，不允许散落读取。

后端配置入口：

```text
services/agent-runtime/app/core/config.py
```

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

## 6. 数据库迁移

数据库迁移必须使用迁移工具管理。

推荐：

```text
Alembic
```

禁止手工修改生产数据库结构而不记录迁移。

## 7. Seed 数据

演示数据通过 seed 脚本创建。

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

后续部署自动化必须作为独立 Issue 实现。
