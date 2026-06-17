# Docker

`Single ECS Docker Runtime` 的 Docker / Docker Compose 部署资产放在这里。

当前仓库内的 ECS preview compose infra foundation 入口包括：

- `compose.ecs.preview.yml`
- `agent-runtime/Dockerfile`
- `env.ecs.preview.example`
- `caddy/Caddyfile`

`compose.ecs.preview.yml` 当前承载 `preview-small` runtime-only slice 的 `mysql / redis / caddy / agent-runtime`。`agent-runtime` 通过 `AGENT_RUNTIME_BUILD_CONTEXT / AGENT_RUNTIME_DOCKERFILE / AGENT_RUNTIME_HOST_PORT / AGENT_RUNTIME_PYPI_INDEX_URL` 读取构建上下文、ECS localhost-only bind 和 Python index 配置，并通过绝对路径 `/opt/insight-agent-platform/env/model-provider.env` 注入真实 provider env。默认 build context 是 `/opt/insight-agent-platform/current`。基础镜像来源仍通过 `MYSQL_IMAGE / REDIS_IMAGE / CADDY_IMAGE` 读取；Preview 环境可以把 `REDIS_IMAGE` 指向 ACR VPC registry；`ACR Personal Edition` 只作为 preview 镜像来源，不作为 production registry。

Current preview-small compose is runtime-only.
`agent-worker` is not part of the default small preview profile.
Use `scripts/deploy/ecs/verify-preview-small-config.sh` to enforce that the default compose service set stays limited to `mysql / redis / caddy / agent-runtime`.

本阶段完成的是 preview runnable app slice，不是完整 `#164`。当前仍未在这里完成 `agent-worker`、`Milvus Lite`、完整 runtime smoke 或 rollback versioning。
