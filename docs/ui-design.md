# UI 与 Figma 工作流事实源

本文档是 Insight Agent Platform 的 UI 与 Figma 工作流事实源，定义 UI 设计流程、Figma 线稿流程、功能覆盖矩阵、设计交接和 UI PR 审查规则。

本文件不实现页面代码，不创建 Figma 文件，不接 API，不接数据库，不实现真实 Agent Run。

## 1. 目标

`docs/ui-design.md` 的目标是约束 UI 设计、Figma 设计、GitHub Issue、PR 和 Code 之间的事实源关系。

固定目标：

- 明确 UI / Figma / Issue / PR / Code 的职责边界。
- 明确 `docs/ui-design.md` 只承载规则、流程和审查标准，不承载所有页面详细结构。
- 明确 Figma Wireframe 承载页面结构、入口、区域、跳转、Web / Mobile Browser 线稿和交互原型。
- 明确 Figma Visual Design 承载最终视觉效果、组件状态和响应式效果。
- 明确 Design-to-Code、Dev Handoff 和 PR 证据要求。
- 保持当前 monorepo、modular monolith、contracts-first、React / TypeScript / Vite / Ant Design、FastAPI / LangGraph 架构不变。

## 2. UI 事实源层级

事实源层级固定如下：

```text
architecture / contracts / database
= 系统能力、数据对象、字段语义事实源

docs/ui-design.md
= UI 流程、设计语言、Figma 线稿流程、功能覆盖矩阵、设计交接和审查规则事实源

Figma Wireframe
= 页面结构、入口、区域、跳转、Web / Mobile Browser 线稿和交互原型事实源

Figma Visual Design
= 最终视觉效果、组件状态、响应式效果事实源

GitHub Issue
= 执行边界事实源

PR
= 履约证明

Code
= 最终工程实现事实源
```

冲突处理：

- Figma 不得推翻 `docs/architecture.md`、`docs/contracts.md`、`docs/database.md` 或 `packages/contracts`。
- Figma 不得静默覆盖 `docs/ui-design.md`。
- Code 不得绕过 GitHub Issue 和 PR 证据要求。
- 如果 Figma、文档、Issue、PR、Code 之间发生冲突，必须回到 Issue 审查。
- Issue #8 和 PR #9 只能作为历史背景，不作为当前执行依据。

## 3. UI 设计流程

UI/Figma 工作流固定为：

```text
docs/ui-design.md
-> Function Coverage Matrix
-> Information Architecture
-> User Flows
-> Figma Wireframe
-> Wireframe Review
-> Figma Visual Design
-> Design-to-Code Check
-> Dev Handoff
-> GitHub Issue
-> PR
-> Code
```

执行规则：

- `docs/ui-design.md` 先定义流程、规则和审查标准。
- Function Coverage Matrix 先确认功能覆盖、入口和 contracts 对齐。
- Information Architecture 先确定一级导航、模块分组、页面归属和跨页面关系。
- User Flows 先确定主任务路径、异常路径和审批 / 反馈路径。
- Figma Wireframe 先确定页面结构，不直接进入高保真。
- Figma Visual Design 必须基于已定稿 Wireframe。
- Design-to-Code Check 必须先判断可实现性，再进入开发 Issue。
- Dev Handoff 必须提供具体 Page / Frame / 版本或更新时间。
- Code 只能按已审查通过的 Issue 执行。

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

## Card / Tag / Action Slot Rules

Card / Tag / Action Slot 是 Web 页面卡片结构的长期规则，Dashboard、#103、#104 后续页面必须复用同一套摆放逻辑。

### Card 分类

| Card 类型 | 用途 | 示例 | 公共组件承接 |
| --- | --- | --- | --- |
| HeroCard | 页面总览 / 业务总览 | 经营状态总览 | 页面私有，后续稳定再抽 |
| MetricCard | 指标值 + 趋势 + 风险 | 季度收入、毛利率 | `shared/ui/metric/MetricCard` |
| RiskCard | 风险 / 异常 / 治理提示 | 收入增速异常、风险摘要 | `shared/ui/cards/AppContentCard` + 页面私有组合 |
| ReportCard | 报告摘要 / 建议动作 | 周经营分析报告 | `shared/ui/cards/AppContentCard` + 页面私有组合 |
| EvidenceCard | 证据 / 来源 / 可信度 | 季度收入证据摘要 | `shared/ui/cards/AppContentCard` / `SourceEvidenceList` |
| OperationsCard | 任务 / 数据质量 / 运维状态 | 平台质量 | `shared/ui/cards/AppContentCard` + 页面私有组合 |
| AssistCard | 右侧栏上下文 | 相关证据、运行轨迹 | `RightAssistPanel` 内部结构 |

规则：

- 不抽万能业务卡片。
- 通用组件只沉淀 slot 容器、按钮分类和状态承接，业务内容仍由页面组合。
- 页面不得私自重建 Card / Tag / Action 摆放体系。

### Card Slot 结构

所有内容卡片遵守统一 slot：

```text
Card
├─ Header
│  ├─ Eyebrow / 类型说明
│  ├─ Title
│  └─ Tag Slot，右上角
│
├─ Main
│  ├─ Value / Summary / Main Content
│  └─ Description
│
├─ Meta
│  ├─ 趋势
│  ├─ 证据数
│  ├─ 来源
│  └─ 可信度
│
└─ Footer Actions
   └─ AppActionGroup，左下横向排列
```

公共组件承接：

- `AppContentCard` 只负责 `eyebrow`、`title`、`tagSlot`、`children`、`description`、`meta`、`footerActions` slot 布局。
- `MetricCard` 必须支持 header tag slot 和 footer actions；趋势、证据数、来源等进入 meta 区。
- `AppActionButton` 负责单个按钮 variant 到 Ant Design Button props 的映射。
- `AppActionGroup` 负责多个按钮的横向排列和 variant 自动排序。

### Tag 位置规则

- Risk Tag / 风险标签固定在卡片 Header 右上角，表示当前卡片对象风险等级，最多 1 个。
- Status Tag / 状态标签仅在非 ready 状态展示，位置同 Header 右上角。
- ready 状态默认不展示。
- Evidence confidence / 证据可信度属于 meta 信息，放在证据卡 meta 行。
- Source type / 来源类型属于 meta 信息，和可信度放在一起。
- Section 标题旁默认不放状态 Tag，除非 Section 本身就是状态对象。

### Action 位置规则

- 页面级主操作放在 Hero / 页面头部右侧。
- Section 级模块入口放在 Section Header 右侧。
- 卡片内部动作统一放在 Footer Actions 左下横向排列。
- 证据 / Trace 条目动作可以跟随条目展示，但必须弱化，并走 `AppActionGroup` / `AppActionButton`。
- RightAssistPanel 动作在分组内左对齐横向排列。
- 证据、来源、运行轨迹等溯源动作统一使用 `sourceLink`，并在 `AppActionGroup` 排序中置后。

后续 #103 / #104 页面必须按本节复用公共组件，不得页面私自摆放按钮、Tag 或卡片结构。

## 5. Web / Mobile Browser 适配规则

Web 与 Mobile Browser 是同一产品链路的不同布局，不允许形成双实现主线。

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
- Mobile Browser 设计必须在 Figma Wireframe 和 Visual Design 中独立表达。

禁止：

- 不允许 Web 有设计而 Mobile Browser 无承接方式。
- 不允许为 Mobile Browser 建立 mock / real 双链路。
- 不允许因为移动端空间不足而删除必要状态、权限或证据入口。

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
- 不能用 Figma 页面数量替代功能覆盖检查。
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

## 7. Figma 文件结构规范

正式 Figma 文件建议命名为：

```text
Insight Agent Platform - Wireframe & Design
```

Figma Page 结构固定为：

```text
00 Cover / Rules
01 Function Coverage Matrix
02 Information Architecture
03 User Flows
04 Web Wireframes
05 Mobile Browser Wireframes
06 Shared Regions & Components
07 Interaction States
08 Visual Design
09 Dev Handoff
Archive
```

Page 使用规则：

- `00 Cover / Rules` 记录设计范围、版本、负责人、状态和关键规则链接。
- `01 Function Coverage Matrix` 对应本文档的功能覆盖矩阵字段。
- `02 Information Architecture` 承载导航、模块、页面分组和信息层级。
- `03 User Flows` 承载主路径、异常路径、审批路径、反馈路径和跳转关系。
- `04 Web Wireframes` 承载 Web 低保真线稿。
- `05 Mobile Browser Wireframes` 承载手机浏览器低保真线稿。
- `06 Shared Regions & Components` 承载可复用区域和组件抽象候选。
- `07 Interaction States` 承载 loading、empty、error、success、warning、权限态、风险态和禁用态。
- `08 Visual Design` 承载高保真视觉稿。
- `09 Dev Handoff` 承载组件映射、token 映射、状态覆盖和可实现性检查结果。
- `Archive` 仅存放历史方案，不作为当前执行事实源。

## 8. Figma Wireframe 线稿标准

Figma Wireframe 不是随意草图。Wireframe 是页面结构事实源。

Wireframe 必须决定：

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

Wireframe 定稿规则：

- Wireframe 定稿后，高保真设计不得随意修改页面结构。
- Wireframe 定稿后，代码实现不得随意修改页面结构。
- 如果高保真或代码阶段发现结构不合理，必须回到 Issue 和 Wireframe 审查。
- Wireframe 不能改变 `docs/architecture.md` 的模块边界。
- Wireframe 不能改变 `docs/contracts.md` 和 `packages/contracts` 的字段语义。
- Wireframe 不承载 mock / real 双链路。

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

## 15. Figma Visual Design 高保真标准

Figma Visual Design 是最终视觉效果事实源，但不能推翻架构和 contracts。

高保真设计必须遵守：

```text
Ant Design v5
Ant Design X
ProComponents
ECharts / Ant Design Charts
shared/ui
shared/theme
```

高保真设计必须覆盖：

- Web 视觉效果。
- Mobile Browser 视觉效果。
- 组件状态。
- 交互反馈。
- 图表样式。
- 表格 / 表单 / 卡片 / Drawer / Modal / Tabs 样式。
- loading / empty / error / success / warning / permission / risk 状态。
- token 映射。
- 基础可访问性要求。

高保真设计禁止：

- 不引入第二套 UI 组件库。
- 不引入无法落地的复杂动效。
- 不改变 Wireframe 已审查通过的页面结构。
- 不改变 contracts 字段语义。
- 不把视觉偏好作为架构调整理由。

## 16. Figma 版本与交接证据门禁

Figma 是外部设计事实源，必须通过 Issue / PR 记录具体链接和版本信息后才能进入执行链路。

门禁规则：

1. 每个使用 Figma 的 Issue 必须记录 Figma 文件链接、Page、Frame、设计阶段、版本或更新时间。
2. PR 不能只写“按 Figma 实现”，必须写清具体 Figma Page / Frame / 版本或更新时间。
3. 如果 Figma 修改影响页面结构、入口、区域划分、交互、响应式规则、shared/ui 组件边界或 Design-to-Code 判断，必须回到 Issue 重新审查。
4. Figma 不得静默覆盖 `docs/ui-design.md`、`docs/architecture.md`、`docs/contracts.md` 或 `packages/contracts`。
5. Figma Dev Handoff 必须包含 Web / Mobile Browser 设计、状态覆盖、组件映射、Design Token 映射和可实现性检查结果。
6. 如 Figma 与代码实现不一致，PR 必须说明差异原因，并回到 Issue 审查后再继续。
7. Archive 中的 Figma frame 不能作为当前执行依据。

## 17. Design-to-Code 可实现性检查

Design-to-Code 检查必须在 Dev Handoff 和代码实现前完成。

检查项固定为：

```text
是否每个组件都能映射到 Ant Design / Ant Design X / ProComponents / shared/ui
是否颜色、间距、圆角、阴影能映射到 shared/theme token
是否图表能用 ECharts / Ant Design Charts 实现
是否状态齐全
是否 Web / Mobile Browser 都有设计
是否符合 docs/ui-design.md
是否符合 architecture / contracts
是否没有第二套 UI 体系
是否没有复杂不可控动效
是否满足基础可访问性要求
是否可以进入 ready for dev
```

检查结果必须写入对应 Issue 或 PR。

不满足 ready for dev 时，不允许进入代码实现。

## 18. Figma Dev Handoff 交接规则

Dev Handoff 是设计进入实现前的交接事实源。

Dev Handoff 必须包含：

- Figma 文件链接。
- Page。
- Frame。
- 设计阶段。
- 版本或更新时间。
- Web 设计入口。
- Mobile Browser 设计入口。
- 组件映射。
- Design Token 映射。
- 图表实现映射。
- 状态覆盖清单。
- 权限态和风险态说明。
- Design-to-Code 检查结果。
- 已知差异和不可实现项。

Dev Handoff 禁止：

- 不允许只写“按 Figma 实现”。
- 不允许缺少 Page / Frame / 版本或更新时间。
- 不允许跳过 Web 或 Mobile Browser 任一端。
- 不允许跳过状态覆盖。
- 不允许绕过 Issue 审查。

## 19. UI PR 审查标准

UI PR 必须按已审查通过的 Issue 和事实源反查。

PR 必须说明：

```text
关联 Issue：
实现内容：
修改范围：
是否只新增 docs/ui-design.md：
是否修改业务代码：
是否新增其他 UI 文档：
是否明确 UI / Figma / Code 事实源层级：
是否明确功能覆盖矩阵规则：
是否明确 Figma 文件结构：
是否明确 Wireframe 线稿标准：
是否明确 Visual Design 高保真标准：
是否明确 Figma 文件链接、Page、Frame、版本或更新时间：
是否明确 Design-to-Code 检查：
是否明确 Figma Dev Handoff：
是否提供具体 Figma Page / Frame / 版本或更新时间：
是否引入 Mock / Real 双链路：
是否改变当前最终工程骨架：
已运行的命令或检查：
风险和未完成事项：
```

本 Issue 对应 PR 的最小检查为：

```text
git diff -- docs/ui-design.md
git diff --check -- docs/ui-design.md
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
不让 Figma 成为可以推翻 architecture / contracts 的事实源
不让 Codex 自由新增页面、模块或组件体系
不把 docs/ui-design.md 写成所有页面细节大百科
```
