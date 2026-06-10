# Deploy

部署配置放在这里。

当前 preview 主线是 `Single ECS Docker Runtime`：

- `deploy/docker/`：Docker / Docker Compose / reverse proxy / runtime 部署资产承载位。
- `scripts/deploy/ecs/`：ECS 主机 bootstrap 与基础校验脚本入口。

`deploy/cloudbase-run/` 仅保留为历史验证资源或后续可选平台，不覆盖当前 preview 主部署链路。
