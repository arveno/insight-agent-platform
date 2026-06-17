# Docker

`Single ECS Docker Runtime` 的 Docker / Docker Compose 部署资产放在这里。

当前仓库内的 ECS preview compose infra foundation 入口包括：

- `compose.ecs.preview.yml`
- `agent-runtime/Dockerfile`
- `env.ecs.preview.example`
- `caddy/Caddyfile`

`compose.ecs.preview.yml` 当前承载 runnable app slice 的 `mysql / redis / caddy / agent-runtime / agent-worker`。`agent-runtime` 与 `agent-worker` 共享 `AGENT_RUNTIME_BUILD_CONTEXT / AGENT_RUNTIME_DOCKERFILE / AGENT_RUNTIME_PYPI_INDEX_URL` 构建配置，并通过绝对路径 `/opt/insight-agent-platform/env/model-provider.env` 注入真实 provider env。`agent-runtime` 额外使用 `AGENT_RUNTIME_HOST_PORT` 做 ECS localhost-only bind；`agent-worker` 使用真实 `python -m src.app.worker` 长驻入口，不暴露公网端口。默认 build context 是 `/opt/insight-agent-platform/current`，与 ECS host-side remote smoke 源码入口保持一致。基础镜像来源仍通过 `MYSQL_IMAGE / REDIS_IMAGE / CADDY_IMAGE` 读取；Preview 环境可以把 `REDIS_IMAGE` 指向 ACR VPC registry；`ACR Personal Edition` 只作为 preview 镜像来源，不作为 production registry。

本阶段完成的是 preview runnable app slice，不是完整 `#164`。当前仍未在这里完成 `Milvus Lite`、rollback versioning 或完整 production-grade CI/CD 编排。
