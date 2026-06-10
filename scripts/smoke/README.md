# Smoke Scripts

Smoke checks for health, core runtime flows, and contract response validation
belong here.

- `runtime_api_foundation.sh`：`#158-1` 的最小 API smoke client，要求显式传入
  `IAP_RUNTIME_BASE_URL` 或把 base URL 作为第一个参数提供；不会自动部署或启动容器。
