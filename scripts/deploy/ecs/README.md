# ECS Bootstrap And Compose Foundation

## 用途

本目录承载 `Single ECS Docker Runtime` 的基础脚本，目前覆盖两段承载位：

- ECS host bootstrap foundation
- ECS preview compose infra foundation

当前仍不负责完整 deploy，不负责完整 smoke / rollback，不负责启动 runtime / worker 业务容器。

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

当前 compose infra foundation 只覆盖：

- `mysql`
- `redis`
- `caddy`

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

- 当前新增的是 compose infra foundation，不代表完整 `#164` 完成。
- 当前不代表 runtime / worker / frontend build deployment / migration / seed / query verify / full smoke / rollback versioning 已完成。
- 后续仍需接入 runtime container、worker container、frontend build output、migration、seed、query verify、full smoke 和 rollback versioning。
- 不允许手工改数据库；后续 preview reset 仍必须回到 `migration -> seed -> query verify`。
- 不允许把 `MySQL 3306`、`Redis 6379`、`FastAPI 8000` 直接暴露到公网。
