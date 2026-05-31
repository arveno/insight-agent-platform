# AGENTS.md

本文件是 Codex / AI Agent / 人类开发者在本仓库执行任务时必须遵守的硬规则。

## 1. 项目定位

本项目是 `Insight Agent Platform`：企业经营分析与决策 Agent 平台。

目标是从第一天建立完整企业级 Agent 产品骨架，覆盖数据、知识、指标、Multi-Agent、Memory、Feedback、Evaluation、Governance、Observability、Model Gateway、报告决策、CI、契约、部署和运维承载位。

## 2. 执行流程

- 需求必须先被拆成 Issue。
- Issue 是执行合同。
- Issue 必须基于需求、`AGENTS.md`、`docs/workflow.md`、`docs/architecture.md`、`docs/contracts.md`、`packages/contracts` 建立。
- Issue 建立后不能直接交给 Codex 执行。
- 必须先进行 Issue 合规审查。
- Issue 合规审查通过并明确允许 Codex 执行后，Codex 才能执行代码。
- Codex 执行前必须确认 Issue 已按 `docs/workflow.md` 完成合规审查。
- 未经审查通过的 Issue，不允许进入代码执行阶段。
- PR 是履约证明。
- PR 只按已审查通过的 Issue 和 `docs/workflow.md` 反查，不重新发明标准。
- CI 是自动守门。
- 用户最终决定是否 Merge。
- Codex 不得绕过 Issue 自由发挥。

每个任务必须基于：

- `AGENTS.md`
- `docs/workflow.md`
- `docs/architecture.md`
- `docs/contracts.md`
- `packages/contracts/*`

并在 Issue 中摘出本次任务相关规则。

## 3. Issue 合规审查

Issue 建立后必须先完成合规审查，审查通过后才允许进入 Codex 代码执行阶段。

审查项至少包括：

- 目标是否清楚。
- 修改范围是否明确。
- 事实源是否完整，包括需求、`AGENTS.md`、`docs/workflow.md`、`docs/architecture.md`、`docs/contracts.md`、`packages/contracts`。
- 是否摘出了本次任务相关规则，而不是只写“遵守文档”。
- 禁止项是否明确。
- 验收标准是否可检查。
- 测试要求是否明确。
- 是否存在 Codex 自由发挥空间。
- 是否越过 `AGENTS` / `workflow` / `architecture` / `contracts` / `packages/contracts` 事实源。
- 是否引入 Mock / Real 双链路、无关依赖、无关重构或业务范围外实现。

审查结论必须明确写入 Issue。未通过审查的 Issue 必须退回补充，不能进入代码执行阶段。

## 4. 总体代码规则

- 采用 monorepo + modular monolith。
- 采用 Contracts-first。
- 保持单链路实现，不做 old / new、mock / real、legacy / current 双轨。
- 不新增无关依赖。
- 不做无关重构。
- 不写临时代码进入正式目录。
- 不把 demo-only 逻辑混入主链路。
- 不保留长期兼容字段兜底。

## 5. 前后端字段一致

核心业务字段以 `packages/contracts` 为事实源。

固定规则：

- 一字段一语义。
- 一语义一字段。
- 同一链路尽量保持字段名一致。
- 字段转换只允许出现在 DB repository、API schema、ViewModel mapper 三个明确边界。

禁止：

```ts
run.id || run.runId || run.analysisRunId
status === 'done' || status === 'completed' || status === 'success'
source.sources || source.evidences || source.references
```

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

禁止：

- UI 直接解析 raw API response。
- UI 直接使用 DB 字段。
- UI 直接使用模型原始输出。
- UI 直接使用 Tool 原始输出。
- UI 直接使用 LangGraph 原始 state。

## 7. 前端规则

- 前端采用 React / TypeScript / Vite / Ant Design 体系。
- 不允许引入第二套 UI 组件库。
- 页面只做编排，不写业务清洗。
- 组件只消费 ViewModel 和 UI State。
- API response 必须先通过 mapper 转成 ViewModel。
- 状态标签、风险等级、空态、错误态必须使用 `shared/ui`。
- 设计 token 必须走 `shared/theme`。

## 8. 后端规则

后端采用 Python / FastAPI / LangGraph。

固定分层：

- `api`：请求、鉴权、参数校验、响应。
- `application`：业务用例编排。
- `domain`：业务对象和业务规则。
- `runtime`：LangGraph 执行。
- `agents`：Agent 职责实现。
- `tools`：受控工具注册与执行。
- `model_gateway`：统一模型调用。
- `memory`：Memory 读写策略。
- `evaluation`：评估、Bad Case、数据集。
- `governance`：权限、SQL Guard、Tool Permission、审计。
- `observability`：Trace、Metrics、Cost、日志。
- `infrastructure`：DB、向量库、缓存、队列、外部依赖。
- `schemas`：API DTO。

禁止：

- Agent Runtime 写进前端。
- Agent 绕过 Tool Registry 调工具。
- 模型调用绕过 Model Gateway。
- 业务代码直接访问数据库连接。
- 模型直接执行 SQL。

## 9. Tool Registry 规则

所有工具必须注册，并包含：

- name
- description
- input schema
- output schema
- permission
- risk level
- timeout
- handler
- error type
- trace event type

## 10. Model Gateway 规则

所有模型调用必须统一走 Model Gateway。

Model Gateway 负责：

- provider adapter
- routing
- retry
- fallback
- cost
- token usage
- latency
- trace
- error mapping

## 11. Memory / Feedback / Evaluation 分域

- Memory：系统长期记住的信息。
- Feedback：用户对本次结果的反馈。
- Evaluation：系统对结果质量的评估。

三者不得混用。

## 12. Mock 策略

产品没有 Mock 模式。

允许：

- seed demo workspace
- test fixtures
- fake provider for tests
- local dev adapter
- contract test data

禁止：

- Mock / Real 模式切换。
- mockRun / realRun 双链路。
- 组件中判断 mock 数据。

## 13. 测试和 CI

每个任务必须给出对应测试或验证证据。

CI 至少覆盖：

- Issue / PR 模板检查
- lint
- typecheck
- unit test
- contract test
- backend test
- frontend build
- smoke test

## 14. PR 规则

PR 必须说明：

- 对应 Issue。
- 实现内容。
- 修改范围。
- 规则遵守情况。
- 契约是否变更。
- 测试结果。
- 风险和未完成事项。

PR 不重新发明标准，只按 Issue 反查。
PR 审查必须按 `docs/workflow.md` 和已审查通过的 Issue 反查。
