# AGENTS.md

本文件是 Codex / AI Agent / 人类开发者在本仓库执行任务时必须遵守的硬规则。

AGENTS.md 只承载 Codex / AI Agent / 人类开发者必须遵守的硬规则、禁止项和执行底线；完整协作流程以 `docs/workflow.md` 为事实源。

## 1. 项目定位

本项目是 `Insight Agent Platform`：企业经营分析与决策 Agent 平台。

目标是从第一天建立完整企业级 Agent 产品骨架，覆盖数据、知识、指标、Multi-Agent、Memory、Feedback、Evaluation、Governance、Observability、Model Gateway、报告决策、CI、契约、部署和运维承载位。

## 2. 执行硬门禁

本节只定义不可绕过的执行底线；完整阶段、状态流转、退回机制和 Merge 条件以 `docs/workflow.md` 为事实源。

- 需求必须先形成 Issue。
- Issue 是执行合同。
- Issue 必须基于需求、`AGENTS.md`、`docs/workflow.md`、`docs/architecture.md`、`docs/contracts.md`、`packages/contracts` 建立。
- Issue 未完成合规审查并明确允许 Codex 执行前，不允许进入代码执行阶段。
- Codex 只能在 Approved Issue 范围内执行，不得自由发挥。
- PR 是履约证明，必须按 Approved Issue 和仓库事实源反向审核。
- Codex 不得自行声明 Issue / PR 审核通过、用户可以 merge 或可以进入下一阶段。
- 用户最终决定是否 Merge。
- Comment 只用于过程记录、状态更新、链接和简短说明，不承载长期正式产出或事实源。

## 3. Issue 合规硬门禁

Issue 合规审查的完整流程、状态和退回机制以 `docs/workflow.md` 为事实源。

AGENTS.md 只保留不可绕过的最低要求：

- 目标必须清楚。
- 修改范围必须明确。
- 事实源必须完整。
- 必须摘出本次任务相关规则，不能只写“遵守文档”。
- 禁止项必须明确。
- 验收标准和测试要求必须可检查。
- 不得给 Codex 留自由发挥空间。
- 不得引入 Mock / Real 双链路、无关依赖、无关重构或业务范围外实现。

未通过合规审查的 Issue 不允许进入代码执行阶段。

## 4. 总体代码规则

- 采用 monorepo + modular monolith。
- 采用 Contracts-first。
- 保持单链路实现，不做 old / new、mock / real、legacy / current 双轨。
- 不新增无关依赖。
- 不做无关重构。
- 不写临时代码进入正式目录。
- 不把 demo-only 逻辑混入主链路。
- 不保留长期兼容字段兜底。

### Codex 代码生成硬规则

- Codex 只能在已审查通过的 Issue 范围内写代码。
- Codex 执行前必须确认 Issue 已是 Approved，且审查结论明确允许 Codex 执行。
- Codex 不得自行判断 Pending Issue 可以改为 Approved；只能按 ChatGPT / 人工明确 prompt 代写审查状态。
- Codex 必须优先使用 parent issue / sub-issue 管理复杂任务；只有 sub-issue 仍然过大或存在多个独立执行 / 审核对象时，才使用 sub-sub-issue。
- Codex 不得用 comment 承载正式产出。
- Codex 可以填写执行报告、已运行检查、修改范围、风险和未完成事项，但不得自行勾选人工 Review Checklist。
- Codex 不允许为了“保险”新增双轨实现。
- Codex 不允许新增 `oldField || newField`、`mockData || realData`、`status === "done" || status === "success"` 这类兜底代码。
- Codex 不允许新增无关依赖。
- Codex 不允许无关重构。
- Codex 不允许为了炫技做过度抽象。
- Codex 不允许把一段清晰顺序逻辑拆成大量无意义小函数。
- 拆函数 / 拆模块只能用于隔离明确职责、减少真实重复、收敛复杂业务链路或让阅读路径更清楚。
- 后端不得绕过 Repository、Model Gateway、Tool Registry。
- 前端不得绕过 Contract -> ViewModel -> UI 链路。
- 代码必须优先清晰、直接、可审查。
- Codex 只读自检和执行报告必须和人工审核分离，不得自行声明“审核通过”“用户可以 merge”或“可以进入下一阶段”。

### 文本、注释与文档工具硬规则

- 用户可见 UI 文案必须进入 i18n，不得散落在组件 JSX 中。
- `aria-label` / `title` / 空态 / 错误态 / 成功态 / 按钮 / 菜单等用户可见文本也属于 UI 文案。
- 代码注释以中文为主体，允许保留必要英文技术名词。
- 注释只解释关键链路、职责边界、阶段限制和非显而易见设计取舍。
- 禁止用注释解释显而易见代码。
- 禁止用注释掩盖不清晰代码。
- 禁止写长期 TODO；未来能力必须回到 Issue / docs。
- 当前不引入 TypeDoc / Sphinx / MkDocs / docgen；文档生成工具接入必须单独 Issue 审查。

### 固定工具链规则

- Codex 不允许自行替换已固定工具链。
- 包管理固定使用 pnpm，不允许引入 npm / yarn 双轨。
- Python 环境 / 依赖管理固定使用 uv，不允许引入 pip requirements 双轨。
- 前端质量检查使用 ESLint，格式化使用 Prettier。
- ESLint 不接入 `eslint-plugin-prettier`，不把 Prettier 当 ESLint rule 跑。
- 前端类型检查使用 TypeScript / `tsc`。
- 前端单元测试和组件测试使用 Vitest / React Testing Library。
- 前端 E2E 和手机浏览器响应式验证使用 Playwright。
- 后端 lint / format 使用 Ruff。
- 后端类型检查使用 mypy。
- 后端测试使用 pytest。

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
