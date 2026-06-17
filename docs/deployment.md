# Deployment

本文档是部署、环境变量、Smoke Test、回滚和排障的事实源。

## 1. 部署目标

项目采用：

- Frontend：`apps/web` 的 `Vite build output` 由 ECS 上的 `Caddy / Nginx` 托管。
- Agent Runtime：`Python / FastAPI / LangGraph`，当前 `preview-small` 通过 ECS 上的 Docker Compose 承载 `agent-runtime`；`agent-worker` 仅保留为后续受控扩展，不属于当前默认栈。
- Database：`MySQL 8.x` container，作为当前 preview 主数据库。
- Vector Store：`Milvus Lite` file-backed preview mode 保留为后续 preview 扩展承载，不属于当前 `1.6G` `preview-small` 默认栈。
- Cache / Queue：`Redis` container，作为当前 preview 的 cache / queue 承载。

当前 preview 部署方向仍是 `Single ECS Docker Runtime`。

### 1.1 ECS preview-small

当前正在使用的 `1.6G` ECS 只能承载压缩后的 `preview-small` runtime-only 环境。

允许：

- `caddy` 或 `nginx`
- frontend static files
- `agent-runtime` FastAPI
- `mysql 8.x`
- `redis`

默认不允许：

- `agent-worker`
- `Milvus Lite`
- ECS host-side `uv` full smoke
- `pytest`
- frontend tests
- heavy diagnostics

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

模型 Provider 配置固定规则如下：

- `apps/web/.env.development.local` 只用于前端 Vite 本地配置，只允许 `VITE_*` 浏览器可见变量，不得放模型 Key。
- 仓库根目录 `.env.model.local` 用于本地模型 provider secret，必须加入忽略规则，不纳入版本管理。
- 仓库根目录 `.env.model.example` 是可提交模板，只提供非 secret 配置结构，不得包含真实 Key。
- ECS preview 运行时模型 provider secret 目标路径固定为 `/opt/insight-agent-platform/env/model-provider.env`，不得回退到 `/opt/insight`。
- active provider 通过 `IAP_MODEL_ACTIVE_PROVIDER` 选择；可以同时声明多个真实 provider 配置，但当前执行只能启用一个 active provider。
- Provider API Key 必须通过 `.env`、ECS env 或 secret 注入；不得提交到仓库，不得粘贴到 issue / PR，不得打印到日志。
- 不允许 `fake provider`、`mock provider`、`hardcoded response` 或本地 / 预览环境双轨 provider。
- smoke、诊断和日志输出只允许表达 `apiKey=configured` 或等价非 secret 状态，不得打印真实 Key。
- Model Gateway failure diagnosis 只能输出 safe redacted message；不得打印 API key、Authorization header、`.env.model.local` 内容或完整 provider raw secret。
- 真实 provider readiness smoke 使用 `scripts/smoke/model-provider-readiness.py`；本地推荐从仓库根目录通过 `uv run --project services/agent-runtime python scripts/smoke/model-provider-readiness.py --env-file .env.model.local` 运行。
- ECS host 上保留 `uv` 只用于受控的人肉授权运维或诊断，不代表 host-side full smoke 成为默认验证路径。
- 当前 `preview-small` 默认禁止 ECS host-side `uv` full smoke；只有 human 明确授权并显式设置 `IAP_ALLOW_ECS_HOST_FULL_SMOKE=1` 时，才允许从 `/opt/insight-agent-platform/current` 手工运行 full smoke，并继续使用 `--env-file /opt/insight-agent-platform/env/model-provider.env` 传入标准 provider env。

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
- Runtime：当前 `1.6G` `preview-small` 只通过 Docker Compose 承载 `agent-runtime` FastAPI；`agent-worker` 不属于默认 small preview profile。
- Database：`MySQL 8.x` container 作为当前 preview 主数据库；`CloudBase SQL` 不作为当前 preview 主数据库。
- Vector Store：`Milvus Lite` 不属于当前 `preview-small` 默认栈；完整 `Milvus Standalone / Distributed` 也不是当前 preview 目标。
- Cache / Queue：`Redis` container 作为当前 preview cache / queue；不依赖 `CloudBase` 标准版、腾讯云 `Redis` 或 VPC 内网互联。
- Security：公网只开放 `22 / 80 / 443`；`MySQL 3306`、`Redis 6379`、`FastAPI` 内部端口不得公网开放。
- Deployment automation：必须逐步落到 `scripts/build`、`scripts/package`、`scripts/deploy`、`scripts/smoke`、`scripts/rollback`。
- Preview reset：必须通过 `migration -> seed -> query verify`，不能通过控制台手工改表或散操作恢复。
- CloudBase：`CloudBase Run / CloudBase Pages / CloudBase SQL` 保留为历史验证资源或后续可选平台，不作为当前 preview 主线；`CloudBase Functions` 仍不作为主部署链路。

### 5.1 ECS preview-small 运行边界

当前 `1.6G` ECS 的正式运行边界固定如下：

- 允许默认运行：`mysql`、`redis`、`caddy`、frontend static、`agent-runtime`
- 默认不允许：`agent-worker`、`Milvus Lite`、ECS host-side `uv` full smoke、`pytest`、frontend tests、heavy diagnostics

当前 smoke 分层固定如下：

- Local full smoke：在开发机运行 `scripts/smoke/runtime-result-delivery.py`，使用 `.env.model.local` 验证完整 runtime 链路。
- ECS lightweight smoke：只验证部署可用性与轻量接口，例如 `/health`、auth/session、`/auth/me`、`/workspaces`，并允许做非 secret 的 provider env configured/redacted 核对；不得调用 provider 模型，不得依赖 `agent-worker`。
- ECS host-side full smoke：当前禁止作为默认验证路径；只有 human 明确授权且确认机器资源足够时，才允许手工执行。

当前 worker 规则固定如下：

- `agent-worker` 不得默认进入 `preview-small` compose。
- 如后续重新接入，必须使用 compose profile。
- 默认不得启动。
- 必须具备 CPU / memory 限制。
- 必须具备 backoff / sleep / error cooldown。
- 验证完必须可关闭。

当前 ECS host foundation 入口：

- `scripts/deploy/ecs/bootstrap.sh`：ECS 主机 bootstrap 脚本，负责基础依赖、swap、Docker Engine、Docker Compose plugin、受控诊断所需的 host-side `uv` 和 `/opt/insight-agent-platform/**` 目录布局。
- `scripts/deploy/ecs/verify-bootstrap.sh`：bootstrap 完成后的基础校验脚本，覆盖 OS / 资源摘要 / swap / Docker / host-side `uv` / 目录布局 / 监听端口，并可选执行 `docker run --rm hello-world`；`uv` 存在不代表允许默认跑 host-side full smoke。
- `scripts/deploy/ecs/diagnose-docker-registry.sh`：Docker registry diagnostics 脚本，负责检查 Docker daemon 状态、registry mirror 配置、Docker Hub DNS/HTTPS 连通性，并可选测试 `hello-world` 拉取能力。
- `scripts/deploy/ecs/configure-docker-registry.sh`：Docker registry mirror configuration 脚本，负责通过 `DOCKER_REGISTRY_MIRROR` 标准化写入 `/etc/docker/daemon.json` 并重启 Docker；该脚本不代表业务部署完成。

当前 ECS compose / runnable app 入口：

- `deploy/docker/compose.ecs.preview.yml`：ECS `preview-small` compose 栈；当前 runnable app slice 只包含 `mysql / redis / caddy / agent-runtime`。`agent-runtime` 只能通过 Caddy 或 ECS localhost bind 访问；`agent-worker` 不属于默认 small preview profile，如后续接入，必须保持 default-off 并继续注入 `/opt/insight-agent-platform/env/model-provider.env`。
- `deploy/docker/agent-runtime/Dockerfile`：preview runtime Docker build 入口，基于 `uv` 安装正式依赖并启动 FastAPI；compose 可通过 `AGENT_RUNTIME_PYPI_INDEX_URL` 指向 ECS 可访问的 Python index。
- `deploy/docker/env.ecs.preview.example`：ECS preview compose env 示例，不包含真实密码；支持基础镜像来源、`MYSQL_HOST_PORT` loopback bind、`AGENT_RUNTIME_HOST_PORT` loopback bind、`AGENT_RUNTIME_PYPI_INDEX_URL`、`AGENT_RUNTIME_BUILD_CONTEXT=/opt/insight-agent-platform/current`、preview cookie 与 CORS 配置。
- `scripts/deploy/ecs/init-compose-env.sh`：在 ECS 上生成 `/opt/insight-agent-platform/env/ecs-preview.env`；默认不覆盖已有 env，显式传 `--force` 才覆盖；支持通过环境变量覆盖默认镜像来源。
- `scripts/deploy/ecs/configure-compose-images.sh`：在 ECS 上只更新已有 `ecs-preview.env` 的 `MYSQL_IMAGE / REDIS_IMAGE / CADDY_IMAGE`，不重置 MySQL 密码，不启动 compose。
- `scripts/deploy/ecs/sync-compose-assets.sh`：从本地同步 `deploy/docker/**` 到 ECS 的 `/opt/insight-agent-platform/deploy/docker/`。
- `scripts/deploy/ecs/up-compose-infra.sh`：只启动 `mysql / redis / caddy` 基础服务，不启动 `agent-runtime / agent-worker`；用于 infra foundation 验证，不代表 runnable app deploy。
- `scripts/deploy/ecs/verify-compose-infra.sh`：校验 compose 文件、env 文件、基础容器状态、MySQL localhost-only bind / ping、Redis ping、`http://127.0.0.1/health` 和非公网暴露约束。
- `scripts/deploy/ecs/deploy-preview-app.sh`：本地触发的 runnable app deploy 入口；负责 frontend build、frontend dist sync、deploy/docker sync、deployed source tree sync 到 `/opt/insight-agent-platform/current`、ECS host `uv` availability、remote compose build/up，以及 `migration -> seed -> query verify`。当前默认 deploy 路径不包含 `agent-worker`，也不自动触发 host-side full smoke。
- ECS preview `query verify` 必须兼容已累计的 runtime artifact；seed baseline 使用 minimum/invariant 校验，不得依赖历史 row_count 固定不变。
- `scripts/smoke/ecs-preview-lightweight.sh`：ECS `preview-small` 轻量 smoke 入口；复用 auth/session curl 级检查，不运行 `uv`、`pytest`、Python full smoke、provider 模型或 `agent-worker`。
- `scripts/smoke/ecs-preview-auth.sh`：curl smoke 入口；覆盖 `/runtime/health`、`/login`、`/auth/login`、`/auth/me`、`/workspaces` 和 `/auth/select-workspace`。
- `scripts/rollback/ecs-compose-infra.sh`：基础 compose rollback 入口；默认只 `compose down` 并保留数据，显式传 `--reset-data` 才删除 `MySQL / Redis` 数据。

ECS compose infra 的基础镜像来源通过 compose env 配置，不应再依赖 ECS 手工 `docker tag redis:7` 作为正式流程。Preview 环境可以把 `REDIS_IMAGE` 指向 ACR VPC registry，例如 `<registry-vpc>/<namespace>/redis:7`；`ACR Personal Edition` 仅作为 preview 镜像来源，不作为 production registry。Production 后续应切换到 `ACR Enterprise Edition` 或等价生产级 registry。

Preview MySQL inspection 只允许 ECS 本机 loopback 暴露。`compose.ecs.preview.yml` 中的 MySQL host bind 必须固定为 `127.0.0.1:${MYSQL_HOST_PORT:-3306}:3306`，不得绑定 `0.0.0.0`，不得把 `3306` 作为公网开放端口。

用户可以通过 `VS Code SQLTools`、`Navicat`、`DBeaver` 等客户端，配合 SSH Tunnel 查看 preview MySQL。推荐本机命令：

```bash
ssh -N -L 13306:127.0.0.1:3306 iap-ecs
```

本机客户端连接参数：

- `Host: 127.0.0.1`
- `Port: 13306`
- `Database / User / Password`：使用 ECS `/opt/insight-agent-platform/env/ecs-preview.env` 中的 MySQL 配置。

`Navicat`、`VS Code SQLTools`、`DBeaver` 只作为查看工具，不是数据库事实源。禁止手工建表、手工加字段、手工改数据，禁止执行未入库、未审查 SQL。

当前 runnable app slice 只完成 frontend static + `agent-runtime` + `mysql` + `redis` + same-origin proxy + lightweight smoke 这条演示链路，不代表完整 `#164` 完成，也不代表 `agent-worker`、`Milvus Lite`、local full smoke 之外的 ECS full runtime smoke、rollback versioning 或完整 CI/CD 已完成。

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

当前 `preview-small` smoke 分层固定如下：

- Local full smoke：`scripts/smoke/runtime-result-delivery.py`，标准运行位置是开发机，标准 provider env 是 `.env.model.local`。
- ECS lightweight smoke：`scripts/smoke/ecs-preview-lightweight.sh`，复用 `scripts/smoke/ecs-preview-auth.sh` 的 curl/auth/session/workspace 检查，不调用 provider 模型，不依赖 `agent-worker`，不运行 `uv` full smoke。
- ECS host-side full smoke：不是当前 `preview-small` 标准路径；只有 human 明确授权并设置 `IAP_ALLOW_ECS_HOST_FULL_SMOKE=1` 时，才允许手工运行。

至少覆盖：

- `/health`
- `/runtime/health`
- `/login`
- `/auth/login`
- `/auth/me`
- `/workspaces`
- `/auth/select-workspace`
- 创建 workspace
- 创建 analysis task
- 创建 analysis run
- `GET /conversations/{conversationId}/messages/{messageId}/stream` JSON replay
- SSE / run events 基础链路
- contract response check

当前 runtime delivery / replay smoke 入口：

- `scripts/smoke/runtime-result-delivery.py`
- 本地真实 provider 推荐运行方式：`uv run --project services/agent-runtime python scripts/smoke/runtime-result-delivery.py --env-file .env.model.local`
- ECS lightweight smoke 标准入口：`bash scripts/smoke/ecs-preview-lightweight.sh`
- ECS host-side full smoke 只作为人肉授权的手工 fallback：`cd /opt/insight-agent-platform/current && IAP_ALLOW_ECS_HOST_FULL_SMOKE=1 UV_DEFAULT_INDEX="${AGENT_RUNTIME_PYPI_INDEX_URL:-https://mirrors.aliyun.com/pypi/simple/}" uv run --project services/agent-runtime python scripts/smoke/runtime-result-delivery.py --env-file /opt/insight-agent-platform/env/model-provider.env`
- 上述 host-side fallback 不是当前 `preview-small` 标准验证路径；如需执行，`uv` 依赖源仍应与 preview image build 保持一致，未显式覆盖时默认走 `https://mirrors.aliyun.com/pypi/simple/`。
- `deploy-preview-app.sh` 必须把 `scripts/smoke/runtime-result-delivery.py`、`database/mysql/queries/*.sql`、`services/agent-runtime/**` 同步到 `/opt/insight-agent-platform/current`
- 当前 SiliconFlow smoke 默认模型固定为 `Qwen/Qwen2.5-7B-Instruct`
- `Qwen/Qwen3.5-4B` 与 `Qwen/Qwen3-8B` timeout 作为 provider/model health evidence 记录在 `#164`，不是新的 provider secret 来源
- 成功路径必须覆盖 `submit -> dispatch -> worker execute -> conversation list/message read surface -> MessageStream JSON replay -> MessageStream SSE replay -> delivery promote -> query verify`。
- runtime 执行失败时，必须转向 failure-path query verify，输出结构化且已脱敏的失败诊断，而不是只打印 generic `status=failed`。
- 日志只允许输出 `apiKey=configured`、`API_KEY=<redacted>` 或等价非 secret 状态。
- success / failure 两条路径都必须证明 MessageStream lifecycle 已 terminalize：success path 以 `stream.completed` 收口，failure path 以 `stream.failed` 或 `stream.cancelled` 收口。
- runtime assistant Message / MessageStream terminal lifecycle 的唯一规则入口是 `RuntimeMessageStreamService`；worker 不得散落手写 terminal append 细节。
- same-conversation single-active-run policy 必须由 backend submit / create-run / dispatch guard 执行；frontend 不得尝试绕过 busy policy。
- `Conversation.currentRunId` 可以继续作为最近一次正式绑定 run 的引用出现在 read surface 中，但它不是 active-run 唯一性本身；运维验证不得只看 `currentRunId` 就假设 busy policy 已满足。
- `GET /conversations/{conversationId}/messages/{messageId}/stream` 的 `Accept: text/event-stream` 只 tail 已持久化 `MessageStream` rows；不得从 `RunEvent` 合成 token，也不得追加第二条 realtime mainline。
- 当前 backend tail 安全常量固定为：heartbeat 间隔 `2s`、poll 间隔 `0.2s`、单次 tail 最长 `15s`。`heartbeat` 是 transport-only event，不落库。

### 8.1 Model Provider Structured Failure Smoke

真实模型 smoke 失败时，输出必须至少包含：

```text
status
runId
provider
model
failureClass
errorType
safeErrorMessage
httpStatus
providerErrorCode
latencyMs
timeoutMs
retryable
retryAfterMs
suggestedAction
```

补充规则：

- `scripts/smoke/model-provider-readiness.py` 用于 provider readiness 与单次调用结构化诊断。
- readiness smoke 的配置错误也必须输出结构化 failure diagnosis，而不是只打印裸 `errorType`；`missing_api_key` 映射 `failureClass=provider_auth_error`，`missing_config / invalid_base_url / unsupported_api_format / invalid_provider` 当前映射 `failureClass=model_gateway_bug`，并要求 `suggestedAction=fix_provider_env_or_configuration`。
- `scripts/smoke/runtime-result-delivery.py` 在 runtime 执行失败时，必须转向 failure-path query verify，输出结构化失败诊断，而不是只打印 generic `status=failed`。
- failure path 的 MessageStream terminal 规则固定为：assistant Message terminalized，`stream.failed.errorCode = ModelCall.failureClass`，且不得留下半开 stream。
- failureClass 必须能区分 `timeout / rate limit / auth / quota / model not found / 5xx / schema error / code bug`。
- 判断 provider/env issue 与 PR regression 时，必须优先做 baseline branch 对照，而不是凭猜测归因。
- `#248` 当前只实现 retryability classification，不包含 silent fallback，也不自动切到第二 provider mainline。
- `safeErrorMessage` 与 `rawErrorRedacted` 都必须经过统一 redaction；两者都不得打印 API key、Authorization header、Bearer token 或 `.env.model.local` 原文。

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

`#164` Ops Gate 对模型 provider failure 的最小门禁影响如下：

- migration 必须包含 `ModelCall` 结构化 failure metadata 落库能力。
- query verify 必须覆盖至少一个 classified failure path，并验证 `ModelCall / RunEvent / AnalysisRun` 一致性。
- smoke 必须能输出非敏感结构化失败诊断。
- deploy / rollback 必须明确新增字段为 additive nullable columns；若需要 schema rollback，必须在旧代码退出依赖后按逆序 drop 新增列。
- remote preview smoke 必须使用真实 provider env，并在失败时保留结构化 failure 证据。

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
