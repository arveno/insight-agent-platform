"""职责：
承载报告生成和报告结构化写入工具的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 Report Tool 边界；
下游是 reports domain、Report contract 和 SourceEvidence。

边界：
允许按报告契约组织章节、摘要和证据引用；不允许在工具内绕过 contracts 输出临时报告结构。

原因：
报告是正式交付物，必须保持结构、字段和证据链稳定，便于前端展示和后续决策追踪。
"""
