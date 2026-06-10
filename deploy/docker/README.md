# Docker

`Single ECS Docker Runtime` 的 Docker / Docker Compose 部署资产放在这里。

当前仓库内的 ECS preview compose infra foundation 入口包括：

- `compose.ecs.preview.yml`
- `env.ecs.preview.example`
- `caddy/Caddyfile`

`compose.ecs.preview.yml` 通过 `MYSQL_IMAGE / REDIS_IMAGE / CADDY_IMAGE` 读取基础镜像来源，默认值分别是 `mysql:8`、`redis:7`、`caddy:2`。Preview 环境可以把 `REDIS_IMAGE` 指向 ACR VPC registry；`ACR Personal Edition` 只作为 preview 镜像来源，不作为 production registry。

本阶段只补 `mysql / redis / caddy` 基础承载位，不在这里补完整 runtime、worker、frontend build deployment、migration、seed、smoke 或 rollback versioning。
