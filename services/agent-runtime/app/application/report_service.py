"""职责：
承载报告和决策用例编排的模块位置。

链路位置：
上游是 API routes、analysis_service 或 Report Tool；当前模块编排 reports domain；
下游是 Report、ReportSection、Decision 和 SourceEvidence contracts。

边界：
允许组织报告保存、查询、证据引用和决策记录；不允许生成脱离 contracts 的临时报告结构。

原因：
报告和决策是企业分析交付物，需要稳定字段、证据链和后续追踪能力。
"""
