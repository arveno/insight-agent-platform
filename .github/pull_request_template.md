## 关联 Issue / Related Issue

Closes #

## Issue Execution Preconditions / Issue 执行前置条件

- 对应 Issue：
- Issue 审查状态：
- 是否已明确允许 Codex 执行：
- 是否存在 Issue 外扩展：
- 如存在 Issue 外扩展，是否已退回 Issue 重新审查：

## 摘要 / Summary

-

## 修改范围 / Scope

-

## Codex Execution Report / Codex 执行报告

Codex 可以填写本节，用于说明执行结果、修改范围、已运行检查、风险和未完成事项。本节不是人工审核结论。

- 是否修改业务代码：
- 是否新增文档：
- 是否新增依赖：
- 是否修改 contracts / database / architecture：
- 是否存在 Issue 外扩展：
- 是否存在未完成事项：

## Rule / Architecture / Contract Self-check / 规则与架构自检

请按本 PR 对应 Issue 和仓库事实源填写；不适用项写“不适用”。

- 是否遵守 AGENTS.md：
- 是否遵守 docs/workflow.md：
- 是否遵守 docs/architecture.md：
- 是否遵守 docs/contracts.md / packages/contracts：
- 是否遵守 UI / ViewModel / Mapper 边界：
- 是否绕过 Model Gateway / Tool Registry：
- 是否引入 mock / real 双链路：
- 是否做无关重构：

## 测试与证据 / Tests and Evidence

已运行：

```text

```

不适用检查及原因：

-

## 风险与后续 / Risks and Follow-up

-

## Review Checklist / 审查清单

以下项目只能由人工或 ChatGPT 辅助审核后勾选，Codex 创建 PR 时不得自行勾选。

- [ ] 已实现 Issue 要求
- [ ] Issue 合规审查结论支持本次实现
- [ ] 修改范围没有超出 Issue
- [ ] 如存在范围扩展，已先退回 Issue 重新审查
- [ ] 验收标准可检查且已满足
- [ ] 必要测试 / 检查已通过，或不适用原因已说明
- [ ] Codex 执行报告与人工审核结论已分离
