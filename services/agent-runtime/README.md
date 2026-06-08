# Agent Runtime

`services/agent-runtime` 是后端 / Agent Runtime 服务根目录。

固定职责：

- `src/app/`：服务启动、配置、路由注册、中间件。
- `src/modules/`：按业务垂直切片组织 `workspace`、`conversations`、`agent_runs`、`data_knowledge`、`model_tools`、`governance`、`metrics`、`reports`、`platform_operations`。
- `src/infrastructure/`：数据库、认证、模型网关、工具注册、RAG、观测等技术底座；运行时代码目录统一使用 `snake_case`。
- `src/shared/`：无业务语义的错误、校验、工具和类型。
- `tests/`：后端单元、契约、集成、smoke、failure simulation 测试承载位。

这是一套最终后端运行时目录结构，不保留临时过渡命名。`apps/web/src` 不在本轮修改范围内。
