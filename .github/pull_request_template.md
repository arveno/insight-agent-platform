## 关联 Issue / Related Issue

Closes #

## Issue 审查门禁 / Issue Review Gate

- [ ] 对应 Issue 已完成合规审查
- [ ] 对应 Issue 已明确允许 Codex 执行
- [ ] 本 PR 只按已审查通过的 Issue 实现
- [ ] 本 PR 没有 Issue 外扩展
- [ ] 如存在 Issue 外扩展，已退回 Issue 重新审查后再执行

## 摘要 / Summary

-

## 修改范围 / Scope

变更范围：

-

## 规则遵守 / Rule Compliance

请确认本 PR 只反查已审查通过的 Issue 和仓库事实源，不重新发明标准：

- [ ] 已遵守 AGENTS.md 规则
- [ ] 已遵守 AGENTS.md 中的代码生成硬规则
- [ ] 已遵守 docs/workflow.md 流程门禁
- [ ] 已遵守 docs/architecture.md 边界
- [ ] 已遵守 docs/architecture.md 中的前后端职责边界
- [ ] 已遵守 docs/contracts.md 语义
- [ ] 已遵守 docs/contracts.md 中的 ViewModel / Mapper 规则
- [ ] 如契约字段变更，已同步 packages/contracts
- [ ] ViewModel 未重命名核心业务字段
- [ ] Mapper 未做业务决策或多字段兜底
- [ ] 已使用项目固定工具链
- [ ] 未引入未审查的新工具或新依赖
- [ ] 未引入 mock / real 双链路
- [ ] UI 未直接渲染 raw API response
- [ ] 模型调用未绕过 Model Gateway
- [ ] 工具调用未绕过 Tool Registry
- [ ] 未做无关重构

## 测试与证据 / Tests and Evidence

已运行的命令或检查：

```text

```

- [ ] 已提供相关 lint / format / typecheck / test / smoke / security 证据，或说明当前任务为何不适用

## 风险与后续 / Risks and Follow-ups

-

- [ ] 不存在已知未修复架构问题；如存在，已明确说明且不允许据此建议关闭治理 Issue

## Review Checklist / 审查清单

- [ ] 已实现 Issue 要求
- [ ] Issue 合规审查结论支持本次实现
- [ ] 修改范围没有超出 Issue
- [ ] 如存在范围扩展，已先退回 Issue 重新审查
- [ ] 验收标准可检查且已满足
- [ ] CI 已通过，或失败原因已说明
- [ ] 用户可以基于本 PR 决定是否 merge
- [ ] 如本 PR 属于治理收口阶段，不存在未修复 `P0 / P1 / P2 / watch items`

## UI Taxonomy Checklist / UI 组件族谱清单

- [ ] 已按 `Ant Design-first Vertical Slice UI Architecture` 实现
- [ ] 未新增错误的 shared 抽象
- [ ] 未把业务组件放进 `shared/ui`、`shared/layout` 或 `shared/navigation`
- [ ] 如修改 `shared/ui` 公共 API，已同步维护 export 组件、export 函数、props contract 和 item contract 的契约 JSDoc
- [ ] `modules` 未直接 import 其他 module 的业务组件
- [ ] `modules` 未依赖 `app`
- [ ] `shared` 未依赖 `modules` 或 `app`
- [ ] 未新增 `index.ts / index.tsx`
- [ ] 未新增 `shared/product`、`legacy`、`temporary`、`transitional` 或其它旧结构回流目录
- [ ] 未绕开 Ant Design 自造基础组件
- [ ] 未把排序、过滤、分组或权限显隐塞进 UI primitive
