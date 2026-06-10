# Deploy Scripts

部署执行入口。

当前 preview 主线是 `Single ECS Docker Runtime`：

- `scripts/deploy/ecs/`：ECS 主机 bootstrap 与基础校验入口。
- `deploy/docker/`：Docker / Docker Compose / 反向代理 / runtime 部署资产承载位。

`deploy/cloudbase-run/` 仅保留为历史验证资源或后续可选平台，不覆盖当前 preview 主线。
