"""职责：
承载指标和语义层查询工具的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 Metric Tool 边界；下游是 metrics domain 和 repository 层。

边界：
允许按契约读取指标定义、口径和结果；不允许在工具内重新解释 raw API response 或绕过指标事实源。

原因：
指标口径必须统一，避免不同 Agent 或页面重复实现 formatter、fallback 或计算规则。
"""
