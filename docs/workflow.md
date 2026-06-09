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
-> 产品体验原型确认
-> 文档事实源更新
-> Issue 体系重整
-> 创建 Issue
-> Issue 合规审查
-> Issue 审查通过
-> Codex 执行
-> 人工截图验收
-> 创建 PR
-> PR 按 Issue 反查
-> CI / 测试 / 契约检查
-> 用户最终 Merge
```

任何节点未完成时，不允许跳到后续节点。

产品体验与正式 UI 相关任务固定追加门禁：

```text
产品体验原型确认
-> 文档事实源更新
-> Issue 体系重整
-> 正式 UI 实现
-> 人工截图验收
```

明确禁止：

- 不能从原型直接进入正式代码。
- 不能用口头规则覆盖文档事实源。
- Issue 重整必须发生在正式 UI 实现前。
- 产品体验原型确认只代表用户流程、页面关系、对象归属和入口流向已被讨论确认，不代表 HTML 原型本身成为正式事实源。
- 必须先把确认后的规则沉淀到 `AGENTS.md`、`docs/ui-design.md`、`docs/architecture.md`、`docs/contracts.md` 和 `packages/contracts`，再进入 Issue 和代码。

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
- 涉及产品体验、导航、页面职责、Inspector 的任务可以附带 `docs/prototypes/product-experience.html` 作为产品体验原型参考，但必须明确正式规则已经沉淀到 `AGENTS.md`、`docs/ui-design.md`、`docs/architecture.md`、`docs/contracts.md` 和 `packages/contracts`。

Issue 是执行合同，不是需求备忘录。不能只写“遵守文档”，必须摘出本次任务相关规则。

## 6. Issue 合规审查阶段

- Issue 创建后默认是“待审查”。
- Issue 创建后不能直接交给 Codex 执行。
- 用户本人或 ChatGPT 可以辅助审查。
- 审核权最终掌握在用户手里。
- 只有 Issue 审查通过，并明确允许 Codex 执行后，Codex 才能开始写代码。

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
- Codex 只能在 Issue 允许范围内修改。
- Codex 不能自由发挥。
- Codex 不能新增无关依赖、无关目录、无关抽象或无关重构。
- Codex 发现 Issue 不清楚时，必须停止执行，说明问题，退回 Issue 补充。
- Codex 不得绕过 `Tool Registry`、`Model Gateway`、contracts、UI ViewModel 链路等硬规则。
- 涉及正式 UI 的任务，Codex 不得绕过已沉淀进 `AGENTS.md`、`docs/ui-design.md`、`docs/architecture.md`、`docs/contracts.md` 和 `packages/contracts` 的产品体验规则、页面编排和 canonical id 规则。
- `docs/prototypes/product-experience.html` 只用于辅助理解用户逻辑、页面跳转、对象归属和入口关系，不能从原型直接进入正式代码。

Codex 的输出必须能回到 Issue 和仓库事实源中逐项验证。

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

## 9. PR 审查阶段

PR 审查必须按 Issue 反查：

- Issue 要求是否完成。
- 修改范围是否越界。
- 是否违反 `AGENTS.md` / `docs/workflow.md` / `docs/architecture.md` / `docs/contracts.md`。
- 是否违反前后端字段一致。
- 是否违反 UI 不消费 raw 数据。
- 是否绕过 `Tool Registry` / `Model Gateway`。
- 是否引入 Mock / Real 双链路。
- 是否有测试和证据。
- 是否需要退回 Issue 重新审查。
- 是否符合 `Ant Design-first Vertical Slice UI Architecture`。
- 是否新增错误的 shared 抽象，或把业务组件放进 `shared/ui`、`shared/layout`、`shared/navigation`。
- 如果修改了 `shared/ui` 公共 API，是否同步维护 export 组件、export 函数、props contract 和 item contract 的契约 JSDoc。
- 是否让 `modules` 互相引用业务组件。
- 是否让 `modules` import `app`，或让 `shared` import `modules / app`。
- 是否新增 `index.ts / index.tsx`、`shared/product`、`legacy / temporary / transitional` 或其它旧结构回流目录。
- 是否绕开 Ant Design 自造基础组件，或只是为了少写 JSX 创建组件。
- 是否把排序、过滤、分组、权限显隐塞进 UI primitive。
- 如果当前 PR 属于治理收口阶段，是否仍保留已识别的 `P1 / P2 / watch items`；治理收口阶段不允许把已识别问题留到后续。

PR 审查不能重新发明标准，只能依据已审查通过的 Issue 和仓库事实源判断是否合格。

补充规则：

- Codex 只能报告执行结果、测试结果和风险，不能自行判断“审核通过”。
- ChatGPT 审核 PR 时必须显式检查上述 UI taxonomy 边界，而不是只看页面是否可运行。
- 只有不存在已知未修复的架构问题、taxonomy 问题或治理 watch items 时，才允许建议关闭对应治理 Issue。
- 用户最终决定是否 merge。

## 10. 退回机制

- Issue 不合格：退回 Issue 补充，不进入 Codex 执行。
- Issue 范围变化：先更新 Issue，再重新审查。
- PR 超出 Issue：退回，不允许直接合并。
- PR 发现标准缺失：先补文档事实源，再重新建 / 审 Issue。
- CI 失败：修复后重新验证，不允许带失败合并。
- Codex 自由发挥：判定不通过，要求回到 Issue 范围内重做。

## 11. Merge 条件

Merge 必须同时满足：

- Issue 已完成合规审查。
- Issue 明确允许 Codex 执行。
- PR 只按 Issue 实现。
- PR 没有 Issue 外扩展。
- CI 通过。
- 测试 / 验证证据完整。
- 用户最终确认。

## 12. 禁止跳步

明确禁止：

- 需求直接交给 Codex 写代码。
- 从产品体验原型直接跳到正式代码。
- Issue 未审查通过就执行。
- PR 超出 Issue 范围。
- 发现规则缺失时直接补代码。
- 用口头约束覆盖仓库事实源。
- 把标准问题留到后续治理。
