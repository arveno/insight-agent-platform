# Insight Agent Platform

企业经营分析与决策 Agent 平台。

## 项目定位

Insight Agent Platform 是一个面向企业经营分析场景的 Agent 全栈平台，帮助企业基于数据源、指标体系、业务知识和历史记忆，完成自然语言分析、原因归因、报告生成、决策建议、反馈沉淀、质量评估和持续优化。

本项目不是 AI 聊天工具、数据问答 Demo、BI 看板或前端工作台，而是一个企业级 Agent 全栈产品骨架。

## 核心能力域

- Workspace / IAM：企业空间、成员、角色、权限、业务域。
- Data & Knowledge：数据源、字段字典、业务文档、知识切片、Source Evidence。
- Metric System：指标定义、指标公式、统计口径、异常阈值、指标血缘。
- Agent Analysis：自然语言分析、Analysis Run、工具调用、中间结论、最终报告。
- Multi-Agent Runtime：基于 LangGraph 的 Orchestrator、Data Analyst、Knowledge、Memory、Report、Evaluation、Governance Agent。
- Memory：User Memory、Workspace Memory、Analysis Memory、Decision Memory。
- Feedback：用户反馈、人工纠错、采纳 / 未采纳、报告偏好反馈。
- Evaluation：Bad Case、Evaluation Dataset、离线评估、在线评估、回归测试、版本对比。
- Model / Prompt / Tool：模型网关、模型路由、Prompt 版本、Tool Registry、RAG Strategy。
- Governance：SQL Guard、Tool Permission、数据权限、敏感字段脱敏、审批、审计。
- Observability：Run Trace、Tool Trace、Model Trace、RAG Trace、Memory Trace、成本、延迟、错误率。
- Report & Decision：分析报告、图表、关键结论、原因归因、建议动作、决策记录。
- Platform Operations：缓存、异步任务、调度、通知、迁移、备份、Smoke / Load / Failure Simulation。

## 技术栈

- Frontend：React / TypeScript / Vite / Ant Design / Ant Design X / TanStack Query / Zustand / ECharts
- Backend：Python / FastAPI / LangGraph / LangChain / LlamaIndex
- Database：MySQL 8.x
- Vector Store：Milvus，Qdrant 作为备选
- Evaluation：DeepEval / RAGAs / LangSmith Dataset
- Observability：自建 Run Trace / LangSmith / Langfuse 备选 / OpenTelemetry 预留
- Model Gateway：Qwen / DeepSeek / Zhipu / SiliconFlow / OpenAI-compatible / Ollama / vLLM / SGLang adapter
- Deploy：Docker / CloudBase Run

## 工程原则

- Monorepo + Modular Monolith。
- Contracts-first。
- 前后端核心字段一致。
- Raw -> Domain -> Contract -> ViewModel -> UI。
- UI 不直接消费 raw API response。
- Agent 工具调用必须走 Tool Registry。
- 模型调用必须走 Model Gateway。
- 不保留 Mock / Real 双链路。
- Issue 是执行合同，PR 是履约证明，CI 是自动守门。

## 工具链入口

- Frontend：pnpm / ESLint / Prettier / TypeScript / Vitest / React Testing Library / Playwright。
- Backend：uv / Ruff / mypy / pytest。
- Contracts：JSON Schema 校验、OpenAPI 检查、类型生成和 contract test 承载位。
- Security：secret scan、依赖审计、Governance / SQL Guard / Tool Permission / Sensitive Field 承载位。

## 本地运行

```bash
pnpm install

pnpm dev
pnpm dev:backend
pnpm debug:api
pnpm debug:health
pnpm help:scripts
```

- `pnpm dev`：启动前端。
- `pnpm dev:backend`：启动 FastAPI 后端。
- `pnpm debug:api`：打开 FastAPI Swagger Docs。
- `pnpm debug:health`：检查 `/health`。
- `pnpm help:scripts`：查看常用命令说明。
- 当前项目仍是最小可运行基线，不包含真实业务功能。

## 目录概览

```text
apps/
  web/                             React 前端 Console
services/
  agent-runtime/                   Python / FastAPI / LangGraph 后端
packages/
  contracts/                       JSON Schema / OpenAPI / generated types
database/
  mysql/                           migration / seed / query / diagram 事实源
deploy/                            Docker / CloudBase Run 部署资产
scripts/                           build / contracts / deploy / smoke / verify 等工程脚本
docs/                              项目事实源文档
.github/                           Issue / PR / CI 模板
```

后端服务根目录固定为 `services/agent-runtime/src`，内部采用最终结构：

- `app/`：启动、配置、路由注册、中间件。
- `modules/`：按业务垂直切片组织 `workspace`、`conversations`、`agent_runs`、`data_knowledge`、`model_tools`、`governance`、`metrics`、`reports`、`platform_operations`。
- `infrastructure/`：数据库、认证、模型网关、工具注册、RAG、观测等技术底座；Python runtime package 目录使用 `snake_case`，例如 `model_gateway`、`tool_registry`。
- `shared/`：无业务语义的错误、校验、工具和类型。

本轮不修改 `apps/web/src`。`packages/contracts/schemas` 继续保留 kebab-case 业务域目录，因为它们是契约事实源路径，不是 Python runtime package。

## 文档事实源

- `AGENTS.md`：Codex / AI Agent / 人类开发者执行任务时必须遵守的硬规则。
- `docs/workflow.md`：需求、Issue、Issue 审查、Codex 执行、PR 审查和 Merge 的协作流程事实源。
- `docs/architecture.md`：系统架构、分层边界和模块职责事实源。
- `docs/contracts.md`：契约语义、字段命名和跨端数据链路事实源。
- `docs/database.md`：MySQL 数据库结构、字段命名、表关系、migration、Navicat 使用边界事实源。
- `docs/deployment.md`：部署承载位和运行环境约束事实源。

## 当前阶段

当前阶段只初始化企业级项目骨架，不实现完整业务功能。
