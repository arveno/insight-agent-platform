# 协作流程事实源

## 1. 目标

本文件定义需求从提出到合并的完整协作流程。

目标是保证 Codex 只能在已审查通过的 Issue 约束内执行代码，不能绕过需求、Issue、仓库事实源、CI 和用户最终确认。

## 2. 角色分工

- 用户：项目负责人、需求最终决策者、Issue / PR 最终审核者、最终 Merge 决策者。
- ChatGPT：负责需求分析、任务拆解、Issue 草案、Issue 合规审查辅助、PR 审查辅助。
- Codex：只按已审查通过的 Issue 执行代码，不得自由发挥。
- GitHub：承载 Issue、PR、CI、Merge 的事实源。

## 3. 流程总览

```text
需求输入
-> 需求分析 / 任务拆解
-> 创建 Issue
-> Issue Pending
-> ChatGPT / 人工审核 Issue
-> Issue Approved
-> Codex 执行
-> 创建 PR
-> ChatGPT / 人工审核 PR
-> CI / 测试 / 契约检查
-> 用户最终 Merge
```

代码 / 仓库变更路径：

```text
Approved Issue
-> Codex 执行
-> PR
-> ChatGPT / 人工反向审核 PR
-> 用户 merge
```

无 PR 设计 / 文档 / 审核路径：

```text
Approved Issue
-> Codex 写回 Issue / sub-issue Body
-> ChatGPT / 人工反向审核 Issue 执行结果
-> Codex 按明确审核结论收口
-> 用户确认进入下一阶段
```

任何节点未完成时，不允许跳到后续节点。

## 4. 需求分析阶段

- 需求可以先在 ChatGPT 中分析、拆解和澄清。
- 需求分析阶段不是正式代码执行阶段。
- 分析完成后，必须形成可执行 Issue。
- 未形成 Issue，不允许交给 Codex 写代码。

## 5. Issue 创建阶段

Issue 必须包含：

- 目标。
- 背景 / 需求来源。
- 修改范围。
- Issue 层级：parent issue、sub-issue、sub-sub-issue 或 standalone issue。
- Parent Issue：sub-issue / sub-sub-issue 必须填写。
- Sub-issue Plan：说明是否拆分、拆分原因和目录。
- 事实源。
- 必须遵守的规则。
- 禁止项。
- 验收标准。
- 测试要求。
- PR 证据要求。

Issue 必须写清本任务需要运行哪些工具命令，包括 lint、format、typecheck、test、smoke、security 中适用的检查。

事实源至少包括：

- 需求本身。
- `AGENTS.md`。
- `docs/workflow.md`。
- `docs/architecture.md`。
- `docs/contracts.md`。
- `packages/contracts`。

Issue 是执行合同，不是需求备忘录。不能只写“遵守文档”，必须摘出本次任务相关规则。

### 5.1 Issue 层级

Issue 层级按任务复杂度决定，不预设固定层级。

```text
父 Issue：
承载一个阶段 / 一个大目标 / 一个可管理的业务闭环。
负责阶段目标、背景、事实源、范围、sub-issue 目录、总体验收标准和关闭条件。

sub-issue：
承载父 Issue 下可独立执行、独立审核、独立验收的产出块或审查块。

sub-sub-issue：
只在 sub-issue 仍然过大，或存在多个独立执行 / 审核对象时使用。

standalone issue：
只用于能一次说清楚、一次完成、一次审核的独立任务。
```

### 5.2 拆分判断规则

- 能用一个 Issue 说清楚、一次完成、一次审核的，不拆。
- 一个阶段包含多个独立产出，就拆 sub-issue。
- 一个 sub-issue 内部又有多个独立页面、流程、模块或审核对象，再拆 sub-sub-issue。
- 不为了流程而流程。
- 不预设固定几级 sub-issue。

### 5.3 Comment 和正式产出承载规则

Comment 只用于过程记录、状态更新、链接、简短说明和历史记录。

明确禁止：

- Comment 承载长期正式产出。
- Comment 承载长期验收结构。
- Comment 作为事实源。

正式产出优先进入：

```text
docs
Issue Body
sub-issue Body
PR
Code
```

如果早期已经把正式内容输出在 comment 中，后续应通过 sub-issue / 文档 / PR 重新结构化，不能长期依赖 comment。

## 6. Issue 合规审查阶段

- Issue 创建后默认是“待审查 / Pending”。
- Issue 创建后不能直接交给 Codex 执行。
- 用户本人或 ChatGPT 可以辅助审查。
- 审核权最终掌握在用户手里。
- 只有经过人工或 ChatGPT 辅助审查后，Issue 才能改为“审查通过 / Approved”。
- 只有 Issue 已 Approved，并明确允许 Codex 执行后，Codex 才能开始写代码。
- Codex 不得自行判断 Issue 是否通过。
- Codex 不得自行把 Pending Issue 改为 Approved。
- Codex 可以按 ChatGPT / 人工明确 prompt 代写 Issue Review Status、Review Result 或勾选项。
- Codex 不得自行勾选 Issue 审查清单。

审查项必须包括：

- 目标是否清楚。
- 修改范围是否明确。
- 事实源是否完整。
- 是否摘出了本任务相关规则。
- 禁止项是否明确。
- 验收标准是否可检查。
- 测试要求是否明确。
- 是否列出本任务需要运行的工具命令。
- 是否存在 Codex 自由发挥空间。
- 是否越过 `AGENTS.md` / `docs/workflow.md` / `docs/architecture.md` / `docs/contracts.md` / `packages/contracts`。
- 是否引入无关重构、无关依赖、Mock / Real 双链路或业务范围外实现。
- 是否需要新增或替换工具链；如需要，必须先更新事实源并重新审查 Issue。

未通过审查的 Issue 必须退回补充，不能进入 Codex 执行阶段。

## 7. Codex 执行阶段

- Codex 只能执行已审查通过的 Issue。
- Codex 执行已批准任务动作，包括但不限于：创建 Issue、更新 Issue Body、创建 sub-issue、写回执行结果、创建 PR、修改代码、运行检查、按 ChatGPT / 人工审核结论收口 Issue。
- Codex 只能在 Issue 允许范围内修改。
- Codex 不能自由发挥。
- Codex 不能新增无关依赖、无关目录、无关抽象或无关重构。
- Codex 发现 Issue 不清楚时，必须停止执行，说明问题，退回 Issue 补充。
- Codex 不得绕过 `Tool Registry`、`Model Gateway`、contracts、UI ViewModel 链路等硬规则。
- Codex 不得把 comment 当正式产出。
- Codex 可以填写执行报告、已运行检查、修改范围、风险和未完成事项。
- Codex 不能自己审核。
- Codex 不能自己判断通过。
- Codex 不能自己推进下一阶段。
- Codex 不能把执行结果当审核结论。
- Codex 不得自行声明“审核通过”“用户可以 merge”或“可以进入下一阶段”。

Codex 的输出必须能回到 Issue 和仓库事实源中逐项验证。

Codex 只读自检 / Codex Read-only Self-check：

```text
在 ChatGPT 制定计划前，Codex 只读查看仓库现状并回报事实，不修改代码、不创建 Issue、不创建 PR。
```

Codex Execution Report：

```text
Codex 执行已审查 Issue 后，回报执行结果、修改范围、检查命令、风险和未完成事项。
```

以上两者都不是人工审核结论，不能替代 ChatGPT / 人工审核。

## 8. PR 创建阶段

PR 必须：

- 关联 Issue。
- 说明实现内容。
- 说明修改范围。
- 说明规则遵守情况。
- 提供测试 / CI / 验证证据。
- 说明风险与未完成项。
- 不重新定义标准，只证明自己按 Issue 完成。

PR 必须提供对应工具命令的执行结果；如某类命令不适用，必须说明原因。

PR 是履约证明，不是重新解释需求的地方。

PR Body 必须区分：

```text
Codex Execution Report / Codex 执行报告
Review Checklist / 审查清单
```

Codex Execution Report 可以由 Codex 填写，用于说明执行结果、修改范围、已运行检查、风险和未完成事项。

Review Checklist 只能由人工或 ChatGPT 辅助审核后勾选。Codex 创建 PR 时不得自行勾选 Review Checklist。

## 9. Issue 执行结果审查阶段

无 PR 任务完成后，ChatGPT / 人工必须按 Approved Issue 反向审核 Issue Body / sub-issue Body 的执行结果。

审核内容包括：

- 是否只做了 Issue 允许的事。
- 是否触碰禁止项。
- 是否越过事实源。
- 是否完成验收标准。
- 是否需要回退上游 Issue。
- 是否可以收口 parent issue。
- 是否可以进入下一阶段待审查准备。

Codex 可以按明确审核结论代写 Review Status、勾选 Acceptance Criteria、追加 Final Review Summary、关闭 Issue。
Codex 不得自行产生审核结论。

## 10. PR 审查阶段

PR 审查必须按 Issue 反查：

- Issue 要求是否完成。
- 修改范围是否越界。
- 是否违反 `AGENTS.md` / `docs/workflow.md` / `docs/architecture.md` / `docs/contracts.md`。
- 是否违反前后端字段一致。
- 是否违反 UI 不消费 raw 数据。
- 是否存在用户可见文案散落在组件中，未进入 i18n。
- 是否关键链路缺少必要中文主体注释。
- 是否存在废话注释、长期 TODO 或用注释掩盖不清晰代码。
- 是否提前引入未审查的文档生成工具或依赖。
- 是否绕过 `Tool Registry` / `Model Gateway`。
- 是否引入 Mock / Real 双链路。
- 是否有测试和证据。
- 是否需要退回 Issue 重新审查。

PR 审查不能重新发明标准，只能依据已审查通过的 Issue 和仓库事实源判断是否合格。

PR 审查结论只能由人工或 ChatGPT 辅助审核后形成。Codex 不得自行声明“用户可以 merge”或“可以进入下一阶段”。

## 11. 退回机制

- Issue 不合格：退回 Issue 补充，不进入 Codex 执行。
- Issue 范围变化：先更新 Issue，再重新审查。
- PR 超出 Issue：退回，不允许直接合并。
- PR 发现标准缺失：先补文档事实源，再重新建 / 审 Issue。
- CI 失败：修复后重新验证，不允许带失败合并。
- Codex 自由发挥：判定不通过，要求回到 Issue 范围内重做。

## 12. Merge 条件

Merge 必须同时满足：

- Issue 已完成合规审查。
- Issue 明确允许 Codex 执行。
- PR 只按 Issue 实现。
- PR 没有 Issue 外扩展。
- CI 通过。
- 测试 / 验证证据完整。
- 用户最终确认。

## 13. 无 PR parent issue 关闭条件

无 PR 的 parent issue 关闭必须满足：

- 所有 sub-issue 已完成执行结果审核。
- 无阻塞问题。
- 不需要回退上游 Issue。
- 未自动推进下一阶段。
- Final Review Summary 已写入 parent issue。
- 用户最终确认。

## 14. 禁止跳步

明确禁止：

- 需求直接交给 Codex 写代码。
- Issue 未审查通过就执行。
- PR 超出 Issue 范围。
- 发现规则缺失时直接补代码。
- 用口头约束覆盖仓库事实源。
- 把标准问题留到后续治理。
