# AGENTS.md

本文件是 Codex / AI Agent / 人类开发者在本仓库执行任务时必须遵守的宪法级硬规则。

## 1. 项目定位

本项目是 `Insight Agent Platform`：企业经营分析与决策 Agent 平台。

目标是从第一天建立完整企业级 Agent 产品骨架，覆盖数据、知识、指标、Multi-Agent、Memory、Feedback、Evaluation、Governance、Observability、Model Gateway、报告决策、CI、契约、部署和运维承载位。

## 2. 事实源分工

事实源分工固定如下：

- `AGENTS.md`：宪法级硬边界；定义不可违反的执行与实现规则。
- `docs/workflow.md`：Issue / PR / review / merge 流程事实源。
- `docs/architecture.md`：系统架构、目录职责、模块 owner、前后端边界事实源。
- `docs/product-design.md`：产品能力、用户流程、页面职责和对象关系事实源。
- `docs/ui-design.md`：UI taxonomy、AppShell、shared primitive、Analysis exception、页面编排规则事实源。
- `docs/contracts.md`：对象、字段、ID、状态、枚举的说明性事实源。
- `docs/runtime-lifecycle.md`：`AnalysisRun / runId` 生命周期和运行时归属规则事实源。
- `docs/runtime-capability-coverage.md`：`#155` Runtime 运行能力覆盖、首轮验收深度和范围压缩边界事实源。
- `docs/runtime-business-integration.md`：真实业务接入手册，不是新的事实源。
- `docs/database.md`：数据库结构、命名、迁移和落库路线事实源。
- `docs/deployment.md`：部署、环境变量、smoke、rollback 事实源。
- `packages/contracts/**`：schema / OpenAPI / generated 的机器可校验事实源。
- `docs/prototypes/**`：产品体验原型参考，不是正式事实源。

硬规则：

- 不得用口头约束覆盖仓库事实源。
- 原型、外部设计稿、截图、临时说明都不能覆盖正式事实源。
- 如果规则缺失、事实源冲突或对象尚未正式化，先补文档与 contracts，再写代码。

## 3. 执行门禁

- 需求必须先进入 Issue。
- Issue 是执行合同，必须引用本次任务相关事实源并摘出相关规则。
- Issue 未完成合规审查、未明确允许 Codex 执行前，Codex 不得写代码。
- Codex 只能在已审查通过的 Issue 范围内执行；范围变化时必须先回到 Issue 重审。
- 流程细节、审查项、PR 门禁、merge 条件以 `docs/workflow.md` 为准。
- Scoped fact-source reading and verification policy is defined in `docs/workflow.md`.
- Codex must not default to full-doc reading or full verification unless the current Issue requires it.
- Codex 不能自审，不能自行判断“审核通过”，不能自行决定 merge，不能自行关闭治理 Issue。
- Issue / PR 的最终判断仍等待 ChatGPT / human review 与用户决策。

## 4. 单链路实现

- 采用 monorepo + modular monolith。
- 采用 contracts-first。
- 保持单链路实现，不做 `old / new`、`mock / real`、`legacy / current` 双轨。
- 不写 demo-only 逻辑进入正式目录。
- 不保留长期兼容字段兜底。
- 不新增无关依赖。
- 不做无关重构。
- 不为“保险”新增双轨实现或 fallback 兼容代码。

禁止：

```ts
oldField || newField;
mockData || realData;
id || xxxId;
metadata.xxxId || xxxId;
status === "done" || status === "completed" || status === "success";
```

## 5. Contracts 与字段语义

- 核心业务字段以 `packages/contracts/**` 为机器可校验事实源。
- `docs/contracts.md` 负责解释对象、字段、ID、状态和枚举语义。
- `docs/runtime-lifecycle.md` 负责解释 `AnalysisRun / runId` 生命周期，不得重新发明字段或枚举。
- `docs/runtime-business-integration.md` 只提供接入路径，不得升格为新的事实源。
- 一字段一语义，一语义一字段。
- 跨前后端共享链路、产品对象链路和 UI 可见业务链路必须使用 canonical business id。
- 字段转换只允许出现在 `repository / API schema / ViewModel mapper` 三个明确边界。

当前 runtime / conversation 主线固定为：

```text
AnalysisRun / runId
Conversation / conversationId
Message / messageId / turnId
MessageStream / messageStreamId
RunEvent / eventId
ExecutionAttempt / attemptId
ApprovalRequest / approvalId
```

禁止：

- `AgentRun` 作为新的正式 contract 对象名。
- `agentRunId / runtimeId / traceId` 替代 `runId`。
- `runEventId` 替代 `eventId`。
- `sessionId / clientMessageId` 回流到正式共享链路，或把本地会话选择态升格为正式共享业务 ID。
- 私自新增第二套 lifecycle status、event type、ID 或字段别名。

## 6. 数据链路

固定链路：

```text
External Raw Data
-> Domain Model
-> Contract Model
-> API Response
-> Frontend ViewModel
-> UI
```

硬规则：

- 前端必须遵守 `Contract -> mapper -> ViewModel -> UI`。
- UI 不直接消费 raw API response。
- UI 不直接使用 DB 字段。
- UI 不直接使用模型原始输出、Tool 原始输出或 LangGraph raw state。
- `Analysis` 的正式共享状态必须围绕 `conversationId / selectedConversationId / messages / currentRun / runEvents` 展开，不得回退到旧 session 命名。

## 7. 前端边界

- 前端采用 `React / TypeScript / Vite / Ant Design` 体系。
- 不允许引入第二套 UI 组件库。
- UI taxonomy、AppShell、shell slots、Analysis exception、页面编排和 shared primitive 细则以 `docs/ui-design.md` 为准。
- 模块 owner、`app / shared / modules` 边界、AppShell / backend owner 归属以 `docs/architecture.md` 为准。

硬规则：

- `app/shell` 只放通用应用外壳，不承接模块业务组件。
- 模块专属 `nav / inspector / workspace / drawer / panel / section / components` 必须留在 `modules/<domain>`。
- `shared` 只放无业务语义 primitive，不得依赖 `app` 或 `modules`。
- `modules` 不得依赖 `app`；`modules` 之间不得直接 import 其他 module 的业务组件。
- `Analysis` 是 conversation-workspace exception，不得被拉回标准 `PageIntro / ContentSection` 主链路。

## 8. 后端边界

- 后端采用 `Python / FastAPI / LangGraph`。
- 后端分层、模块 owner、route / module / runtime 边界以 `docs/architecture.md` 为准。
- `AnalysisRun` 的运行主线和 owner 边界以 `docs/runtime-lifecycle.md` 与 `docs/architecture.md` 为准。

硬规则：

- 不得绕过 `Repository` 访问业务数据。
- 不得绕过 `Model Gateway` 调模型。
- 不得绕过 `Tool Registry` 调工具。
- 不得让模型直接执行 SQL。
- 不得把 Agent Runtime、Tool 调用、模型调用或向量检索逻辑写进前端。

## 9. Mock、Memory、Feedback、Evaluation

- 产品没有 Mock 模式。
- 允许 `seed demo workspace`、`test fixtures`、`fake provider for tests`、`local dev adapter`、`contract test data`。
- 禁止 `Mock / Real` 模式切换。
- 禁止 `mockRun / realRun` 双链路。
- `Memory`、`Feedback`、`Evaluation` 三域不得混用。

## 10. 固定工具链与验证

- 包管理固定使用 `pnpm`。
- Python 环境与依赖管理固定使用 `uv`。
- 前端 lint 使用 `ESLint`，格式化使用 `Prettier`，类型检查使用 `tsc`，测试使用 `Vitest / React Testing Library / Playwright`。
- 后端 lint / format 使用 `Ruff`，类型检查使用 `mypy`，测试使用 `pytest`。
- 每个任务都必须提供对应验证证据。
- CI 至少覆盖 Issue / PR 模板检查、lint、typecheck、unit test、contract test、backend test、frontend build、smoke test。

## 11. 原型与正式实现

- `docs/prototypes/**` 只用于产品体验原型参考、用户流程讨论和可点击验证。
- 原型不得作为正式 React 组件结构、API、DB、contracts、ViewModel 或真实 runtime 的事实源。
- 原型中的内容只有在沉淀进 `docs/**` 与 `packages/contracts/**` 后，才能进入 Issue 和代码实现。

## 12. PR 与合并

- PR 是履约证明，不重新发明标准。
- PR 必须按已审查通过的 Issue 与 `docs/workflow.md` 反查。
- PR 必须说明实现内容、修改范围、规则遵守情况、契约是否变更、测试结果和风险。
- 用户最终决定是否 merge。
