# Rollback Scripts

回滚入口。

后续承载前端版本回滚、后端容器版本回滚、回滚后 smoke test。

当前已补一个基础入口：

- `ecs-compose-infra.sh`：停止 ECS preview compose infra foundation；默认保留 `MySQL / Redis` 数据，显式传 `--reset-data` 时才清空数据目录。
