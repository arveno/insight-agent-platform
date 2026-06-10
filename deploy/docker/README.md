# Docker

`Single ECS Docker Runtime` 的 Docker / Docker Compose 部署资产放在这里。

当前仓库内的 ECS preview compose infra foundation 入口包括：

- `compose.ecs.preview.yml`
- `env.ecs.preview.example`
- `caddy/Caddyfile`

本阶段只补 `mysql / redis / caddy` 基础承载位，不在这里补完整 runtime、worker、frontend build deployment、migration、seed、smoke 或 rollback versioning。
