# ECS Bootstrap And Compose Foundation

## 用途

本目录承载 `Single ECS Docker Runtime` 的基础脚本，目前覆盖两段承载位：

- ECS host bootstrap foundation
- ECS preview compose infra foundation
- ECS preview runnable app deployment slice

当前已支持 frontend static + `agent-runtime` 的 `preview-small` runnable app deploy，但仍不负责 `agent-worker`、`Milvus Lite`、完整 CI/CD 或 rollback versioning。

如 ECS 默认 Python index 出现超时，可通过 `AGENT_RUNTIME_PYPI_INDEX_URL` 覆盖 runtime image build 使用的依赖源；默认值为 `https://mirrors.aliyun.com/pypi/simple/`。

## Current preview-small boundary

当前 `1.6G` ECS 只允许 `preview-small` runtime-only slice：

- `mysql`
- `redis`
- `caddy`
- frontend static
- `agent-runtime`

默认不允许：

- `agent-worker`
- `Milvus Lite`
- ECS host-side `uv` full smoke
- `pytest`
- frontend tests
- heavy diagnostics

## 前置条件

- 目标主机是 `Ubuntu 24.04` 或兼容 Docker 官方 apt 仓库的 `Debian` 环境。
- 使用 `deploy` 用户登录执行。
- `deploy` 已具备 passwordless `sudo`。
- 仓库内容已经存在于目标主机；`bootstrap.sh` 不会 clone repo。
- 本脚本不要求切 root shell，也不应该以 root 登录执行。

## 运行 bootstrap

```bash
ssh iap-ecs
cd /path/to/insight-agent-platform
bash scripts/deploy/ecs/bootstrap.sh
```

`bootstrap.sh` 会：

- 安装基础依赖
- 通过 Docker 官方 apt repository 安装 Docker Engine 与 Docker Compose plugin
- 安装 ECS host-side `uv`
- 创建 `/opt/insight-agent-platform/**` 目录布局
- 创建默认 `2G` swap（如果系统尚无 active swap）
- 启用并启动 Docker

`bootstrap.sh` 不会：

- clone repo
- 部署业务代码
- 启动 `MySQL / Redis / Milvus Lite / agent-runtime / agent-worker / frontend / Caddy`
- 修改安全组、SSHD 或公网端口策略

## 重新登录让 docker group 生效

`bootstrap.sh` 会把 `deploy` 加入 `docker` group。当前 shell 不会自动刷新组信息，执行完后需要重新登录 SSH：

```bash
exit
ssh iap-ecs
cd /path/to/insight-agent-platform
```

## 运行 verify-bootstrap

基础校验：

```bash
bash scripts/deploy/ecs/verify-bootstrap.sh
```

显式验证 Docker 拉起 `hello-world`：

```bash
bash scripts/deploy/ecs/verify-bootstrap.sh --hello-world
```

`verify-bootstrap.sh` 会检查：

- OS version
- CPU / memory / disk summary
- swap status
- Docker version
- Docker Compose version
- `uv` version
- Docker service status
- `/opt/insight-agent-platform/**` 目录布局
- 当前监听端口
- `3306 / 6379 / 8000` 不应监听在非 loopback 接口

## 为什么需要 Docker registry diagnostics

ECS bootstrap 成功后，业务部署前还需要确认 Docker daemon 是否能够稳定解析并访问镜像源。`hello-world` 只用于验证 Docker 镜像拉取能力，不代表业务部署已经完成。

## 运行 diagnose-docker-registry

基础诊断：

```bash
bash scripts/deploy/ecs/diagnose-docker-registry.sh
```

显式测试 Docker 拉取 `hello-world`：

```bash
bash scripts/deploy/ecs/diagnose-docker-registry.sh --pull-hello-world
```

`diagnose-docker-registry.sh` 会输出：

- Docker daemon active 状态
- Docker version / Docker Compose version
- 当前 registry mirror 配置
- `registry-1.docker.io` / `auth.docker.io` 的 DNS 解析结果
- Docker Hub HTTPS 连通性

默认不会强制 pull 镜像，也不会部署业务。

## 运行 configure-docker-registry

通过环境变量传入 mirror：

```bash
DOCKER_REGISTRY_MIRROR="https://example-mirror" bash scripts/deploy/ecs/configure-docker-registry.sh
```

`configure-docker-registry.sh` 会：

- 备份 `/etc/docker/daemon.json`
- 保留现有 JSON 字段
- 写入 `registry-mirrors`
- 重启 Docker 并验证 daemon 恢复

不要手工编辑 `/etc/docker/daemon.json`，应通过脚本执行。

完成后建议重新运行：

```bash
bash scripts/deploy/ecs/diagnose-docker-registry.sh --pull-hello-world
```

或：

```bash
bash scripts/deploy/ecs/verify-bootstrap.sh --hello-world
```

该步骤只处理镜像拉取能力，不部署业务。

## Compose Infra Foundation

当前 `compose.ecs.preview.yml` 包含：

- `mysql`
- `redis`
- `caddy`
- `agent-runtime`

镜像来源通过 compose env 配置，不再把 `redis:7` 的 ECS 手工 `docker tag` 视为正式流程。Preview 如需使用 ACR，应通过 `MYSQL_IMAGE / REDIS_IMAGE / CADDY_IMAGE` 配置镜像地址；`ACR Personal Edition` 只作为 preview 镜像来源，不作为 production registry。

仓库入口：

- `deploy/docker/compose.ecs.preview.yml`
- `deploy/docker/env.ecs.preview.example`
- `scripts/deploy/ecs/init-compose-env.sh`
- `scripts/deploy/ecs/configure-compose-images.sh`
- `scripts/deploy/ecs/sync-compose-assets.sh`
- `scripts/deploy/ecs/up-compose-infra.sh`
- `scripts/deploy/ecs/verify-compose-infra.sh`
- `scripts/rollback/ecs-compose-infra.sh`

### 初始化 compose env

在 ECS 上创建 `/opt/insight-agent-platform/env/ecs-preview.env`：

```bash
bash scripts/deploy/ecs/init-compose-env.sh
```

默认不覆盖已有 env；显式覆盖：

```bash
bash scripts/deploy/ecs/init-compose-env.sh --force
```

如需覆盖默认镜像来源，可在执行时传入环境变量：

```bash
REDIS_IMAGE="crpi-xxxx-vpc.cn-beijing.personal.cr.aliyuncs.com/iap-preview/redis:7" \
bash scripts/deploy/ecs/init-compose-env.sh --force
```

该脚本只生成 compose preview env，不会打印密码，也不会启动容器。

### 更新 compose 镜像来源

在 ECS 上更新已有 `/opt/insight-agent-platform/env/ecs-preview.env` 的镜像变量：

```bash
REDIS_IMAGE="crpi-xxxx-vpc.cn-beijing.personal.cr.aliyuncs.com/iap-preview/redis:7" \
bash scripts/deploy/ecs/configure-compose-images.sh
```

该脚本只更新 `MYSQL_IMAGE / REDIS_IMAGE / CADDY_IMAGE`，会先备份 env 文件，不重置 MySQL 密码，不启动容器，不执行 compose，不部署业务。

### 同步 compose 资产

在本地执行，把 `deploy/docker/**` 同步到 ECS：

```bash
bash scripts/deploy/ecs/sync-compose-assets.sh
```

该脚本只同步 compose 资产，不修改 env，不启动容器，不部署业务。

### 启动 compose infra

在 ECS 上执行：

```bash
bash scripts/deploy/ecs/up-compose-infra.sh
```

该脚本只启动：

- `mysql`
- `redis`
- `caddy`

不启动 `agent-runtime`、`agent-worker`，也不部署 frontend build output。

## Runnable App Deployment Slice

本地执行完整 runnable app deploy：

```bash
IAP_ECS_HOST_ALIAS=iap-ecs \
PREVIEW_BASE_URL=http://<ECS_IP_OR_DOMAIN> \
pnpm deploy:ecs-preview
```

该入口会：

- 本地执行 `pnpm --dir apps/web build`
- 同步 `apps/web/dist` 到 `/opt/insight-agent-platform/shared/frontend`
- 同步 `deploy/docker/**` 到 `/opt/insight-agent-platform/deploy/docker`
- 同步已部署源码快照到 `/opt/insight-agent-platform/current`
- 确保 ECS host 上可用 `uv`
- 在 ECS 上 `docker compose build agent-runtime`
- 在 ECS 上 `docker compose up -d mysql redis agent-runtime caddy`
- 运行 `migration -> seed -> query verify`
- 输出 `/login` 访问地址

其中 ECS preview `query verify` 允许环境中已经存在累计的 runtime artifact 行；它验证 seed minimum 和链路 invariant，不要求历史 runtime row_count 固定不变。

ECS lightweight smoke 标准入口：

```bash
PREVIEW_BASE_URL=http://<ECS_IP_OR_DOMAIN> \
bash scripts/smoke/ecs-preview-lightweight.sh
```

`ecs-preview-lightweight.sh` 复用 `ecs-preview-auth.sh` 的 curl/auth/session/workspace 检查，只验证 `/health` 与轻量 endpoint；它不会运行 `uv`、`pytest`、Python full smoke、provider 模型调用或 `agent-worker`。

host-side full runtime smoke 仅作为手工 fallback，不是 `preview-small` 标准路径：

```bash
cd /opt/insight-agent-platform/current
IAP_ALLOW_ECS_HOST_FULL_SMOKE=1 \
UV_DEFAULT_INDEX="${AGENT_RUNTIME_PYPI_INDEX_URL:-https://mirrors.aliyun.com/pypi/simple/}" \
uv run --project services/agent-runtime python scripts/smoke/runtime-result-delivery.py \
  --env-file /opt/insight-agent-platform/env/model-provider.env
```

只有 human 明确授权且确认资源足够时，才允许使用这条 fallback。

只做 dry-run：

```bash
bash scripts/deploy/ecs/deploy-preview-app.sh --dry-run
```

显式清空 ECS preview MySQL / Redis 数据后再部署：

```bash
IAP_ECS_HOST_ALIAS=iap-ecs \
PREVIEW_BASE_URL=http://<ECS_IP_OR_DOMAIN> \
pnpm deploy:ecs-preview -- --reset-data
```

auth smoke：

```bash
PREVIEW_BASE_URL=http://<ECS_IP_OR_DOMAIN> \
pnpm smoke:ecs-preview-auth
```

ECS preview 的公网 namespace 固定为：

```text
Frontend page routes: /...
Public runtime API: /api/*
```

`deploy-preview-app.sh` 会用 `VITE_AGENT_RUNTIME_BASE_URL=/api` 构建前端，因此像 `/metrics` 这样的页面 route 会继续回到 SPA，runtime API 则通过 Caddy 的 `/api/* -> strip /api -> agent-runtime:8000` 代理进入后端。

本地前端通过 Vite proxy 调试 ECS preview：

```bash
VITE_AGENT_RUNTIME_BASE_URL=/api \
VITE_AGENT_RUNTIME_PROXY_TARGET=http://<ECS_IP_OR_DOMAIN> \
pnpm dev
```

访问：

```text
http://127.0.0.1:5173/login
```

### 校验 compose infra

在 ECS 上执行：

```bash
bash scripts/deploy/ecs/verify-compose-infra.sh
```

该脚本会检查：

- compose 文件存在
- env 文件存在
- `mysql / redis / caddy` 容器运行
- MySQL ping
- Redis ping
- `http://127.0.0.1/health`
- `3306 / 6379` 不监听非 loopback 公网接口

### 回滚 compose infra

默认只停止基础栈并保留数据：

```bash
bash scripts/rollback/ecs-compose-infra.sh
```

显式清空 `MySQL / Redis` 数据目录：

```bash
bash scripts/rollback/ecs-compose-infra.sh --reset-data
```

## 边界

- 当前新增的是 runnable app deployment slice，不代表完整 `#164` 完成。
- 当前不代表 `agent-worker`、`Milvus Lite`、host-side full runtime smoke、rollback versioning 或完整 CI/CD 已完成。
- 后续仍需补 worker、vector store、更多 smoke、failure simulation 和版本化 rollback。
- 不允许手工改数据库；后续 preview reset 仍必须回到 `migration -> seed -> query verify`。
- 不允许把 `MySQL 3306`、`Redis 6379`、`FastAPI 8000` 直接暴露到公网。

## Safe restore runbook

How to restore runtime-only preview safely:

- do not run host-side full smoke
- do not start worker
- validate only `/health` and lightweight endpoints
- prefer `bash scripts/smoke/ecs-preview-lightweight.sh`

## Emergency note

If Docker stack exhausts memory:

- stop `docker.service` and `docker.socket`
- keep ECS stable
- do not restart full stack until runtime-only profile is confirmed
