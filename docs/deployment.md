# Deployment

本文档是部署、环境变量、Smoke Test、回滚和排障的事实源。

## 1. 部署目标

项目采用：

- Frontend：`apps/web` 的 `Vite build output` 由 ECS 上的 `Caddy / Nginx` 托管。
- Agent Runtime：`Python / FastAPI / LangGraph`，与 `agent-worker` 一起由 ECS 上的 Docker Compose 承载。
- Database：`MySQL 8.x` container，作为当前 preview 主数据库。
- Vector Store：`Milvus Lite` file-backed preview mode，作为当前 preview 的向量检索承载。
- Cache / Queue：`Redis` container，作为当前 preview 的 cache / queue 承载。

当前 preview 主部署链路是 `Single ECS Docker Runtime`。

一台 ECS 承载以下 preview 责任：

- `caddy` 或 `nginx`
- frontend static files
- `agent-runtime` FastAPI
- `agent-worker`
- `mysql 8.x`
- `redis`
- `Milvus Lite` file-backed data

`CloudBase Run / CloudBase Pages / CloudBase SQL` 仅保留为历史验证资源或后续可选平台，不作为当前 preview 主线。`CloudBase Functions` 仍不作为当前主部署链路。

`#155` 的 preview 部署优先策略、可重置 preview 边界和本地基础设施压缩边界以 `docs/runtime-capability-coverage.md` 为准。

当前 preview 前端主线不是 `CloudBase Pages`、`EdgeOne Pages` 或 `OSS` 静态托管。

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

当前 preview 目标是通过 Docker Compose 承载前端静态资源、后端服务和基础设施，而不是只构建单个 runtime 容器。

## 5. Single ECS Docker Runtime

当前 preview 部署要求如下：

- Frontend：`apps/web` 的 build output 由 ECS 上的 `Caddy / Nginx` 托管。
- Runtime：ECS 通过 Docker Compose 承载 `agent-runtime` FastAPI 与 `agent-worker`。
- Database：`MySQL 8.x` container 作为当前 preview 主数据库；`CloudBase SQL` 不作为当前 preview 主数据库。
- Vector Store：`Milvus Lite` 是当前 preview 的向量检索承载；完整 `Milvus Standalone / Distributed` 不是当前 preview 目标。
- Cache / Queue：`Redis` container 作为当前 preview cache / queue；不依赖 `CloudBase` 标准版、腾讯云 `Redis` 或 VPC 内网互联。
- Security：公网只开放 `22 / 80 / 443`；`MySQL 3306`、`Redis 6379`、`FastAPI` 内部端口不得公网开放。
- Deployment automation：必须逐步落到 `scripts/build`、`scripts/package`、`scripts/deploy`、`scripts/smoke`、`scripts/rollback`。
- Preview reset：必须通过 `migration -> seed -> query verify`，不能通过控制台手工改表或散操作恢复。
- CloudBase：`CloudBase Run / CloudBase Pages / CloudBase SQL` 保留为历史验证资源或后续可选平台，不作为当前 preview 主线；`CloudBase Functions` 仍不作为主部署链路。

当前 ECS host foundation 入口：

- `scripts/deploy/ecs/bootstrap.sh`：ECS 主机 bootstrap 脚本，负责基础依赖、swap、Docker Engine、Docker Compose plugin 和 `/opt/insight-agent-platform/**` 目录布局。
- `scripts/deploy/ecs/verify-bootstrap.sh`：bootstrap 完成后的基础校验脚本，覆盖 OS / 资源摘要 / swap / Docker / 目录布局 / 监听端口，并可选执行 `docker run --rm hello-world`。
- `scripts/deploy/ecs/diagnose-docker-registry.sh`：Docker registry diagnostics 脚本，负责检查 Docker daemon 状态、registry mirror 配置、Docker Hub DNS/HTTPS 连通性，并可选测试 `hello-world` 拉取能力。
- `scripts/deploy/ecs/configure-docker-registry.sh`：Docker registry mirror configuration 脚本，负责通过 `DOCKER_REGISTRY_MIRROR` 标准化写入 `/etc/docker/daemon.json` 并重启 Docker；该脚本不代表业务部署完成。

如仓库中保留历史部署目录，它们也不能覆盖以上当前 preview 主线事实。

CloudBase 历史部署配置如存在，放在：

```text
deploy/cloudbase-run/
```

这些目录当前不作为 preview 主线事实源。

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
