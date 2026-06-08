# Agent Runtime

`services/agent-runtime` 是后端 / Agent Runtime 服务根目录。

固定职责：

- `src/app/`：服务启动、配置、路由注册、中间件。
- `src/modules/`：按业务垂直切片组织 `workspace`、`conversations`、`agent-runs`、`data-knowledge`、`model-tools`、`governance`、`metrics`、`reports`、`platform-operations`。
- `src/infrastructure/`：数据库、认证、模型网关、工具注册、RAG、观测等技术底座。
- `src/shared/`：无业务语义的错误、校验、工具和类型。
- `tests/`：后端单元、契约、集成、smoke、failure simulation 测试承载位。

当前阶段后端仍是最小骨架，优先表达目录职责和依赖边界，不在本轮引入新的业务逻辑。
