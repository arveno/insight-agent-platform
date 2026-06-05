# 产品体验 HTML 原型

`docs/prototypes/product-experience.html` 是产品体验原型 / 用户流程参考 / 可点击验证稿。

它用于验证：

- 页面关系
- 用户路径
- 对象归属
- 页面职责
- 入口流向

它用于帮助讨论：

- 用户逻辑
- 页面跳转
- 对象归属
- 入口关系
- 产品体验方向

它不是正式事实源，不代表正式 React 组件结构，不定义导航实现、Inspector 实现、API / DB / contracts / ViewModel，也不实现真实 Agent Run。

正式实现仍需遵守：

- `AGENTS.md`
- `docs/ui-design.md`
- `docs/architecture.md`
- `docs/contracts.md`
- `packages/contracts/*`

原型中的内容只有在人工确认并沉淀进正式文档后，才能进入正式 Issue 和代码实现。

这个原型只使用单文件 HTML、CSS 和少量原生 JavaScript，用来说明：

- 产品怎么用
- 页面怎么跳
- 哪个页面承载什么
- 哪个页面只展示摘要 / 入口

LeftNav 原型采用两级导航：

1. 全局导航：Workspace 当前空间 + 主工作区 + 能力分组
2. 模块内导航：Analysis 会话列表 / Reports 报告列表，并覆盖 LeftNav 区域后提供返回主导航能力

打开方式：直接在浏览器中打开 `docs/prototypes/product-experience.html`。
