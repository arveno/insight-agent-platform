# ECS Bootstrap Foundation

## 用途

本目录承载 `Single ECS Docker Runtime` 的第一阶段基础脚本，只负责 ECS 主机 bootstrap foundation：

- 基础依赖安装
- Docker Engine / Docker Compose plugin 安装
- Docker registry diagnostics / mirror configuration
- swap 配置
- 项目目录布局初始化
- 基础校验

本目录不负责完整 deploy，不负责 smoke / rollback，不负责启动业务容器。

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

## 边界

- 本 PR 只完成 bootstrap foundation，不完成完整 deploy / smoke / rollback。
- 不允许手工改数据库；后续 preview reset 仍必须回到 `migration -> seed -> query verify`。
- 不允许把 `MySQL 3306`、`Redis 6379`、`FastAPI 8000` 直接暴露到公网。
