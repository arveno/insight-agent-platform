# UI Blueprint 与 Production UI Shell 工作流事实源

本文档是 Insight Agent Platform 的 UI Blueprint 与 Production UI Shell 工作流事实源，定义 UI 设计流程、Wireframe Blueprint、功能覆盖矩阵、视觉规范、生产级页面骨架交接和 UI PR 审查规则。

本文件不实现页面代码，不创建外部设计工具文件，不接 API，不接数据库，不实现真实 Agent Run。

## 1. 目标

`docs/ui-design.md` 的目标是约束 UI Blueprint、AI Visual Reference、Ant Design Theme / Visual Specification、Production UI Shell、GitHub Issue、PR 和 Code 之间的事实源关系。

固定目标：

- 明确 UI Blueprint / AI Visual Reference / Production UI Shell / parent issue / sub-issue / PR / Code 的职责边界。
- 明确 `docs/ui-design.md` 只承载规则、流程和审查标准，不承载所有页面详细结构。
- 明确 Wireframe Blueprint 承载页面结构、入口、区域、跳转、Web / Mobile Browser 线稿和交互原型。
- 明确 AI Visual Reference 只能提供视觉方向，不作为页面结构事实源、产品能力事实源或最终开发稿。
- 明确 Ant Design Theme / Visual Specification 承载可落地的视觉规范、组件状态、响应式效果和 token 映射。
- 明确 Production UI Shell 是生产级页面骨架，不是临时原型、Demo 页面或一次性静态页面。
- 明确 Design-to-Code、Blueprint-to-Code Handoff 和 PR 证据要求。
- 保持当前 monorepo、modular monolith、contracts-first、React / TypeScript / Vite / Ant Design、FastAPI / LangGraph 架构不变。

## 2. UI 事实源层级

事实源层级固定如下：

```text
product-design / architecture / contracts / database
= 产品能力、系统能力、数据对象、字段语义和数据库边界事实源

docs/ui-design.md
= UI Blueprint、设计语言、视觉规范、Production UI Shell、设计交接和审查规则事实源

Issue #11 功能覆盖矩阵
= 功能覆盖、入口、承接页面、Web / Mobile Browser 展示方式和 contracts 对齐事实源

Issue #12 IA / User Flow
= 信息架构、页面职责、页面流转、跨页面入口和 Mobile Browser 流转事实源

Issue #13 Wireframe Blueprint
= 页面结构、入口、区域、跳转、Web / Mobile Browser 线稿和交互原型事实源

AI Visual Reference
= 视觉方向参考，不是页面结构事实源、产品能力事实源或最终开发稿

Ant Design Theme / Visual Specification
= 可落地视觉规范、组件状态、响应式效果、图表样式和 token 映射事实源

Production UI Shell
= 最终路由、AppShell、页面职责、区域布局、组件边界、状态展示、响应式规则和视觉基线事实源

GitHub parent issue / sub-issue / PR / Code
= 执行边界、独立产出或审核对象、履约证明和最终工程实现事实源
```

冲突处理：

- Wireframe Blueprint 不得推翻 `docs/product-design.md`、`docs/architecture.md`、`docs/contracts.md`、`docs/database.md` 或 `packages/contracts`。
- AI Visual Reference、外部设计工具、截图或视觉偏好不得推翻产品能力、IA、页面职责、contracts 或稳定 UI 槽位。
- Production UI Shell 不得绕过 `Contract -> ViewModel -> UI`、`shared/ui` 或 `shared/theme`。
- Code 不得绕过 GitHub Issue 和 PR 证据要求。
- 如果 Blueprint、视觉参考、文档、Issue、PR、Code 之间发生冲突，必须回到 Issue 审查。
- Issue #8 和 PR #9 只能作为历史背景，不作为当前执行依据。

## 3. UI 设计流程

UI / 视觉工作流固定为：

```text
docs/ui-design.md
-> Function Coverage Matrix
-> Information Architecture
-> User Flows
-> Wireframe Blueprint
-> Blueprint Review
-> AI Visual Reference
-> Ant Design Theme / Visual Specification
-> Production UI Shell
-> Design-to-Code Check
-> GitHub Issue
-> PR
-> Code
```

执行规则：

- `docs/ui-design.md` 先定义流程、规则和审查标准。
- Function Coverage Matrix 先确认功能覆盖、入口和 contracts 对齐。
- Information Architecture 先确定一级导航、模块分组、页面归属和跨页面关系。
- User Flows 先确定主任务路径、异常路径和审批 / 反馈路径。
- Wireframe Blueprint 先确定页面结构，不直接进入视觉规范或页面实现。
- Blueprint Review 必须先确认页面职责、区域边界、Web / Mobile Browser 承接方式和状态覆盖。
- AI Visual Reference 只能辅助视觉方向，不得修改 Wireframe Blueprint 的页面结构。
- Ant Design Theme / Visual Specification 必须把视觉方向收敛为 Ant Design、Ant Design X、ProComponents、ECharts、`shared/ui` 和 `shared/theme` 可落地规范。
- Production UI Shell 必须基于已审查通过的 Blueprint 和 Visual Specification。
- Design-to-Code Check 必须先判断可实现性，再进入开发 Issue。
- Production UI Shell Handoff 必须提供 Wireframe Blueprint 引用、AI Visual Reference 参考说明、Ant Design token / `shared/ui` / `shared/theme` 映射和运行说明或截图。
- Code 只能按已审查通过的 Issue 执行。
- 阶段性 Blueprint 如果包含多个独立页面、流程或审核对象，必须通过父 Issue + sub-issue / 必要时 sub-sub-issue 管理。
- 父 Issue comment 只用于过程记录、状态更新和链接，不承载长期正式 Blueprint 产出或验收结构。

## 4. 统一 UI 设计语言

统一 UI 设计语言固定如下：

```text
基础组件：Ant Design v5
AI 对话 / 输入 / 回复类场景：Ant Design X
复杂中后台表格 / 表单 / 详情：ProComponents 按需
图表：ECharts / Ant Design Charts
状态组件：shared/ui
主题变量：shared/theme
```

规则：

- 不引入第二套 UI 组件库。
- 不每个页面自建按钮、卡片、状态色或反馈样式。
- 状态标签、风险等级、空态、错误态、加载态必须通过 `shared/ui` 收敛。
- 颜色、字号、间距、圆角、阴影等必须能映射到 `shared/theme` token。
- AI 输入、AI 回复和会话式交互优先使用 Ant Design X。
- 图表必须能用 ECharts / Ant Design Charts 实现。
- 页面组件不得直接消费 raw API response。
- 页面组件不得直接使用数据库字段、模型原始输出、Tool 原始输出或 LangGraph raw state。

## 5. Web / Mobile Browser 适配规则

Web 与 Mobile Browser 是同一产品链路的不同布局，不允许形成双实现主线。

Web / Mobile Browser 的关系固定为：

```text
同一产品能力、同一业务事实源、同一设计系统、不同端侧体验编排。
```

Web / Mobile Browser 不允许形成两套业务体系。

Web 规则：

- 左侧导航和顶部 Header 由 AppShell 承载。
- 主内容区承载页面核心任务。
- 右侧辅助区可承载 Trace、Source Evidence、Report Outline、审计详情和配置详情。
- 表格、图表、报告和详情必须有清晰区域边界。
- 高风险操作必须有明确确认、权限态和审计入口。

Mobile Browser 规则：

- 左侧导航折叠为 Drawer 或顶部菜单。
- 主内容区单列优先。
- 右侧辅助区改为 Drawer、Tabs 或详情页。
- 表格优先卡片化；确需表格时允许横向滚动，但必须保留主字段和状态。
- 复杂任务拆分为 Steps、Tabs、Collapse 或分段表单。
- Mobile Browser 设计必须在 Wireframe Blueprint、Ant Design Visual Specification 和 Production UI Shell 中独立表达。

允许：

- WebComposition / MobileComposition 分开。
- Web 使用高密度工作台布局。
- Mobile 使用单列、卡片化、Drawer / Tabs / Collapse。
- RightAssistPanel 在 Mobile 中降级为 Drawer / Tabs / Detail page。
- Table 在 Mobile 中降级为 CardList / 简化表格 / 必要横向滚动。
- 高风险操作在 Mobile 中降级为只读、轻操作或明确确认。

禁止：

- 不允许 Web 有设计而 Mobile Browser 无承接方式。
- 不允许把 Mobile 当作 Web 缩小版。
- 不允许为 Mobile 建立单独业务模型。
- 不允许为 Mobile 建立单独 contracts / ViewModel / API / mapper / store / formatter。
- 不允许为 Mobile Browser 建立 mock / real 双链路。
- 不允许因为移动端空间不足而删除必要状态、权限、风险、Evidence、Trace、Report 入口。
- 不允许让 Web / Mobile 使用不同 Icon System、状态色、风险色或主题体系。

## 6. 功能覆盖矩阵规则

功能覆盖矩阵用于防止骨架功能遗漏、入口混乱和页面乱堆功能。

矩阵字段固定为：

```text
模块
功能
主入口
承接页面
页面区域
Web 展示方式
Mobile 展示方式
可复用组件
关联 contracts
是否已覆盖
```

使用规则：

- 每个一级模块能力必须进入功能覆盖矩阵。
- 每个功能必须有主入口和承接页面。
- 每个功能必须说明 Web 展示方式和 Mobile 展示方式。
- 每个功能必须说明可复用组件候选，例如 `shared/ui`、`shared/layout`、`shared/theme`、`shared/charts`。
- 每个功能必须对齐 `packages/contracts` 中的业务对象。
- 不能用外部设计工具的页面数量替代功能覆盖检查。
- 如果发现功能没有承接页面，必须先更新矩阵和 Issue，不能直接补页面代码。

矩阵覆盖范围至少包括：

- Workspace / IAM
- Data Source & Ingestion
- Metric & Semantic Layer
- Knowledge & RAG
- Agent Analysis
- Multi-Agent Runtime
- Tool Registry / MCP Adapter
- Memory Center
- Feedback Center
- Evaluation Center
- Model / Prompt / Tool / RAG Management
- Governance & Security
- Observability & Monitoring
- Report & Decision
- Business Dashboard
- Admin / Settings
- Platform Operations

## 7. Wireframe Blueprint 输出规范

Wireframe Blueprint 是页面结构事实源，应以已审查通过的父 Issue + sub-issue / 必要时 sub-sub-issue、Review Packet 或仓库允许范围内的交付物承载。不得新增未审查的 UI 文档，不得把外部设计工具作为必经事实源。

Wireframe Blueprint 不应长期由父 Issue comment 承载。父 Issue comment 只做状态记录、过程说明和链接；如果早期已把正式 Blueprint 输出在 comment 中，后续必须通过 sub-issue / 文档 / PR 重新结构化，不能长期依赖 comment。

Blueprint 输出结构固定为：

```text
00 Foundation / Rules
01 Function Coverage Matrix
02 Information Architecture
03 User Flows
04 Web Wireframe Blueprints
05 Mobile Browser Wireframe Blueprints
06 Shared Regions & Components
07 Interaction States
08 AI Visual Reference Notes
09 Ant Design Theme / Visual Specification
10 Production UI Shell Handoff
Archive
```

输出使用规则：

- `00 Foundation / Rules` 记录设计范围、负责人、状态和关键规则链接。
- `01 Function Coverage Matrix` 对应本文档的功能覆盖矩阵字段。
- `02 Information Architecture` 承载导航、模块、页面分组和信息层级。
- `03 User Flows` 承载主路径、异常路径、审批路径、反馈路径和跳转关系。
- `04 Web Wireframe Blueprints` 承载 Web 低保真线稿。
- `05 Mobile Browser Wireframe Blueprints` 承载手机浏览器低保真线稿。
- `06 Shared Regions & Components` 承载可复用区域和组件抽象候选。
- `07 Interaction States` 承载 loading、empty、error、success、warning、权限态、风险态和禁用态。
- `08 AI Visual Reference Notes` 只记录视觉方向和参考约束，不承载结构事实源。
- `09 Ant Design Theme / Visual Specification` 承载可落地视觉规范、token、组件状态和响应式规则。
- `10 Production UI Shell Handoff` 承载组件映射、token 映射、状态覆盖、运行说明和可实现性检查结果。
- `Archive` 仅存放历史方案，不作为当前执行事实源。

## 8. Wireframe Blueprint 标准

Wireframe Blueprint 不是随意草图。Wireframe Blueprint 是页面结构事实源。

Wireframe Blueprint 必须决定：

- 页面职责。
- 功能归属。
- 入口关系。
- 区域划分。
- 操作层级。
- 跳转关系。
- Web 布局。
- Mobile Browser 折叠方式。
- 右侧辅助面板规则。
- Drawer / Modal / Tabs 使用规则。
- loading / empty / error / permission / risk 等状态位置。

Wireframe Blueprint 定稿规则：

- Wireframe Blueprint 定稿后，视觉规范不得随意修改页面结构。
- Wireframe Blueprint 定稿后，代码实现不得随意修改页面结构。
- 如果视觉规范、Production UI Shell 或代码阶段发现结构不合理，必须回到 Issue 和 Blueprint 审查。
- Wireframe Blueprint 不能改变 `docs/architecture.md` 的模块边界。
- Wireframe Blueprint 不能改变 `docs/contracts.md` 和 `packages/contracts` 的字段语义。
- Wireframe Blueprint 不承载 mock / real 双链路。

## 9. 信息架构 IA 标准

Information Architecture 用于定义用户如何理解和进入系统能力。

IA 必须覆盖：

- 一级导航。
- 模块分组。
- 页面归属。
- 功能归属。
- 跨页面跳转。
- 主任务路径入口。
- 异常路径入口。
- 全局搜索、通知、工作区、权限等全局入口。

IA 必须对齐 `docs/architecture.md` 固定一级模块。后续新能力必须落入既有模块之一，不允许随意新增孤立大模块。

IA 输出至少说明：

- 导航名称。
- 对应架构模块。
- 对应页面。
- 承接功能。
- 关联 contracts。
- Web 入口。
- Mobile Browser 入口。
- 禁止混入的能力。

## 10. User Flow / 页面流转标准

User Flow 用于定义用户完成任务的路径。

每条 User Flow 必须说明：

- 用户目标。
- 起点页面。
- 触发入口。
- 关键步骤。
- 成功路径。
- 异常路径。
- 权限不足路径。
- 数据不足路径。
- 反馈或人工介入路径。
- 结束状态。
- 关联 contracts。

必须覆盖的流程类型：

- 创建 / 查看分析任务。
- 查看 Agent Run 过程和 Trace。
- 查看 Report 与 Source Evidence。
- 处理 Feedback。
- 查看 Memory 使用。
- 执行 Evaluation 检查。
- 管理 Model / Prompt / Tool / RAG 配置。
- 查看 Governance / Audit / Risk 结果。
- 查看 Observability 和 Platform Operations 状态。

User Flow 不得直接定义后端业务实现；后端实现仍以 architecture、contracts 和已审查 Issue 为准。

## 11. Web Wireframe 标准

Web Wireframe 必须表达页面结构，不表达最终视觉细节。

每个 Web Wireframe 至少标注：

- 页面名称。
- 路由或页面入口。
- 所属模块。
- 页面目标。
- 顶部区域。
- 左侧导航或局部导航。
- 主内容区。
- 右侧辅助区。
- 主要操作。
- 次要操作。
- loading / empty / error 状态位置。
- 权限态和风险提示位置。
- 关联 contracts。
- 可复用组件候选。

Web Wireframe 禁止：

- 不直接写业务算法。
- 不直接写 SQL 或数据库字段。
- 不直接展示模型原始输出。
- 不直接展示 Tool 原始输出。
- 不定义 mock / real 双链路。

## 12. Mobile Browser Wireframe 标准

Mobile Browser Wireframe 必须表达 Web 功能在手机浏览器中的承接方式。

每个 Mobile Browser Wireframe 至少标注：

- 页面名称。
- 页面入口。
- 折叠后的导航方式。
- 单列主内容结构。
- Tabs / Drawer / Modal 使用方式。
- 卡片化或横向滚动策略。
- 主要操作位置。
- 次要操作位置。
- loading / empty / error 状态位置。
- 权限态和风险提示位置。
- 与 Web Wireframe 的结构差异。

Mobile Browser Wireframe 禁止：

- 不删除必要业务状态。
- 不删除必要权限态。
- 不删除必要 Source Evidence、Trace 或审计入口。
- 不为移动端建立独立数据链路。

## 13. Shared Regions & Components 抽象规则

Shared Regions & Components 用于识别跨页面复用的布局区域和 UI 组件。

候选范围：

- `shared/ui`：StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState、FeedbackPanel、SourceEvidenceList、TraceTimeline 等。
- `shared/layout`：AppShell、PageHeader、FilterBar、RightAssistPanel、ResponsivePageShell 等。
- `shared/theme`：颜色、间距、字号、圆角、阴影、图表 token。
- `shared/charts`：指标趋势、成本趋势、评估结果、数据质量图表。

抽象规则：

- 只有跨业务域复用才进入 shared。
- 单一 feature 内部组件不得提前抽到 shared。
- shared 组件不得依赖 feature。
- shared 组件不得解析 raw API response。
- shared 组件只消费 ViewModel、UI State 或 contract 枚举。
- shared 组件不得访问数据库字段、模型原始输出、Tool 原始输出或 LangGraph raw state。

## 14. Interaction States 状态设计规则

Interaction States 必须覆盖业务状态、页面异步状态、操作反馈状态和权限态。

业务状态：

- 必须来自 contracts 枚举。
- 使用 StatusTag / RiskBadge 展示。
- 不允许自由字符串。
- 不允许 `done` / `success` / `completed` 多字段兜底。

页面异步状态：

- loading 使用 LoadingState。
- empty 使用 EmptyState。
- error 使用 ErrorState。
- 不允许各页面自写一套加载、空态、错误态。

操作反馈状态：

- success / warning / info / error 属于 UI 操作反馈，不等于业务状态。
- 必须通过 `shared/ui` 封装或 Ant Design 反馈能力的统一封装使用。
- warning 用于风险、权限、数据不完整、证据不足、操作影响等提示场景。
- success 只表示用户操作完成，不得替代 `completed` / `passed` / `succeeded` 等业务状态。

权限态：

- 权限态来自 Role / PermissionPolicy / Governance 结果。
- UI 只展示禁用态、只读态、权限空态或审批入口。
- UI 不做权限业务决策。

## 15. AI Visual Reference 与 Ant Design Visual Specification

AI Visual Reference 用于提供专业视觉效果方向，但不是页面结构事实源、产品能力事实源、最终开发稿或交付门禁。

AI Visual Reference 规则：

- 只能表达视觉方向、氛围、密度、信息层级感和参考风格。
- 不得改变产品主线、IA、页面职责、contracts、稳定 UI 槽位或 Wireframe Blueprint。
- 不得作为外部设计工具或截图偏好推翻事实源的依据。
- 不得替代 Ant Design Theme / Visual Specification。
- 不得要求引入第二套 UI 组件库或不可落地的复杂动效。

Ant Design Theme / Visual Specification 是视觉落地规范，必须遵守：

```text
Ant Design v5
Ant Design X
ProComponents
ECharts / Ant Design Charts
shared/ui
shared/theme
```

Ant Design Visual Specification 必须覆盖：

- Web 视觉效果。
- Mobile Browser 视觉效果。
- 组件状态。
- 交互反馈。
- 图表样式。
- 表格 / 表单 / 卡片 / Drawer / Modal / Tabs 样式。
- loading / empty / error / success / warning / permission / risk 状态。
- token 映射。
- 基础可访问性要求。

Ant Design Visual Specification 禁止：

- 不引入第二套 UI 组件库。
- 不引入无法落地的复杂动效。
- 不改变 Wireframe Blueprint 已审查通过的页面结构。
- 不改变 contracts 字段语义。
- 不把视觉偏好作为架构调整理由。

## 16. Production UI Shell 定义

Production UI Shell 是按最终工程标准实现的生产级页面骨架，不是临时原型、Demo 页面或一次性静态页面。

Production UI Shell 包含最终路由、AppShell、页面职责、区域布局、组件边界、状态展示、响应式规则和视觉基线。

当前阶段可以使用 fixture / static ViewModel 数据驱动页面，但 fixture 只是临时数据来源，不代表页面是临时方案。

Production UI Shell 后续实现时，应允许 Web / Mobile 有不同页面编排，但必须共享同一套业务模型和设计系统。

推荐实现方向：

```text
shared ViewModel
shared/ui
shared/layout
shared/theme
shared/charts
WebComposition
MobileComposition
```

实现阶段不得把双端体验编排演变成双业务链路。

后续真实功能接入时，必须复用 Production UI Shell 的页面结构、组件体系和 ViewModel 边界，只替换数据来源和业务执行链路，不得重写页面、不新增 mock / real 双链路、不绕过 contracts / ViewModel / shared/ui / shared/theme。

Production UI Shell 必须满足：

- 路由和 AppShell 与最终工程方向一致。
- 页面只做编排，不写业务清洗。
- 组件只消费 ViewModel 和 UI State。
- 状态标签、风险等级、空态、错误态必须使用 `shared/ui`。
- 设计 token 必须走 `shared/theme`。
- fixture / static ViewModel 只能作为当前阶段临时数据来源，不得进入长期业务链路。

## 17. Design-to-Code 可实现性检查

Design-to-Code 检查必须在 Production UI Shell Handoff 和代码实现前完成。

检查项固定为：

```text
是否每个组件都能映射到 Ant Design / Ant Design X / ProComponents / shared/ui
是否颜色、间距、圆角、阴影能映射到 shared/theme token
是否图表能用 ECharts / Ant Design Charts 实现
是否状态齐全
是否 Web / Mobile Browser 都有设计
是否符合 Wireframe Blueprint
是否符合 Ant Design Theme / Visual Specification
是否符合 docs/ui-design.md
是否符合 architecture / contracts
是否没有第二套 UI 体系
是否没有复杂不可控动效
是否 Production UI Shell 可以进入 ready for dev
```

检查结果必须写入对应 Issue 或 PR。

不满足 ready for dev 时，不允许进入代码实现。

## 18. Production UI Shell Handoff / Blueprint-to-Code 交接规则

Production UI Shell Handoff 是 Blueprint 和视觉规范进入实现前的交接事实源。

Production UI Shell Handoff 必须包含：

- Wireframe Blueprint 引用。
- AI Visual Reference 是否仅作为参考。
- Ant Design Theme / Visual Specification 引用。
- 路由与 AppShell 说明。
- 页面职责和区域布局。
- 组件映射。
- Design Token 映射。
- `shared/ui`、`shared/layout`、`shared/theme`、`shared/charts` 映射。
- 图表实现映射。
- 状态覆盖清单。
- Web / Mobile Browser 响应式规则。
- 权限态和风险态说明。
- fixture / static ViewModel 数据来源说明。
- Production UI Shell 截图或运行说明。
- Design-to-Code 检查结果。
- 已知差异和不可实现项。

Production UI Shell Handoff 禁止：

- 不允许只写“按视觉参考实现”。
- 不允许缺少 Wireframe Blueprint 引用。
- 不允许把 AI Visual Reference 写成结构事实源。
- 不允许跳过 Web 或 Mobile Browser 任一端。
- 不允许跳过状态覆盖。
- 不允许把 Production UI Shell 写成临时原型。
- 不允许把 fixture 数据写成长期业务链路。
- 不允许绕过 Issue 审查。

## 19. UI PR 审查标准

UI PR 必须按已审查通过的 Issue 和事实源反查。

PR 必须说明：

```text
关联 Issue：
实现内容：
修改范围：
是否只修改 Issue 允许的文件：
是否修改业务代码：
是否新增其他 UI 文档：
是否明确 UI Blueprint / Production UI Shell / Code 事实源层级：
是否明确功能覆盖矩阵规则：
是否明确 Wireframe Blueprint 输出规范：
是否明确 Wireframe Blueprint 标准：
是否明确 AI Visual Reference 只是参考：
是否明确 Ant Design Theme / Visual Specification 是视觉落地规范：
是否明确 Production UI Shell 是生产级页面骨架：
是否提供 Wireframe Blueprint 引用：
是否提供 AI Visual Reference 参考说明：
是否提供 Ant Design Theme / token / shared/ui 映射：
是否提供 Production UI Shell 截图或运行说明：
是否明确 Design-to-Code 检查：
是否明确 Production UI Shell Handoff：
是否引入 Mock / Real 双链路：
是否改变当前最终工程骨架：
已运行的命令或检查：
风险和未完成事项：
```

本 Issue 对应 PR 的最小检查为：

```text
git diff -- docs/ui-design.md docs/product-design.md
git diff --check -- docs/ui-design.md docs/product-design.md
```

纯文档事实源任务不要求运行前端构建、后端测试或数据库 migration，但 PR 必须说明原因。

## 20. 禁止项

固定禁止：

```text
不写业务功能
不接 API
不接数据库
不实现真实 Agent Run
不做模型调用
不做 RAG
不做 Evaluation
不新增第二套 UI 组件库
不新增多个 UI 文档
不写 mock / real 双链路
不借本任务调整当前最终工程骨架
不让 AI Visual Reference、外部设计工具、截图或视觉偏好成为可以推翻 product-design / architecture / contracts 的事实源
不让 Production UI Shell 成为临时原型
不让 fixture / static ViewModel 数据成为长期业务链路
不让 Codex 自由新增页面、模块或组件体系
不把 docs/ui-design.md 写成所有页面细节大百科
```
