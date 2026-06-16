# Smoke Scripts

Smoke checks for health, core runtime flows, and contract response validation
belong here.

- `runtime_api_foundation.sh`：`#158-1` 的最小 API smoke client，要求显式传入
  `IAP_RUNTIME_BASE_URL` 或把 base URL 作为第一个参数提供；不会自动部署或启动容器。
- `model-provider-readiness.py`：`#239` 的真实模型 provider readiness smoke，支持
  `--env-file` 和 `--provider`，只输出 `apiKey=configured` 等 masked 状态，不打印真实
  Key。推荐从仓库根目录使用 `uv` 管理的 runtime Python 执行：

  ```bash
  uv run --project services/agent-runtime python scripts/smoke/model-provider-readiness.py --env-file .env.model.local
  ```

  可选 backup provider：

  ```bash
  uv run --project services/agent-runtime python scripts/smoke/model-provider-readiness.py --env-file .env.model.local --provider zhipu
  ```

- `runtime-worker-model-execution.py`：`#240` 的本地真实执行 smoke。脚本会在本地
  `mysql` 容器上执行 `migrate / seed`，然后通过 canonical
  `POST /analysis-tasks/submit` + `POST /analysis-runs/{runId}/dispatch` 创建并推进 run，
  再调用真实 `Tool Registry` 与 `Model Gateway` 路径，最后执行 run-scoped query verify。
  推荐命令：

  ```bash
  uv run --project services/agent-runtime python scripts/smoke/runtime-worker-model-execution.py --env-file .env.model.local
  ```
