"""职责：
承载模型、工具和运行成本观测的模块位置。

链路位置：
上游是 model_gateway/cost、tools 和 runtime；当前模块归集成本指标；下游是监控、报表和治理分析。

边界：
允许统计成本、token、调用次数和延迟口径；不允许替代 ModelCall contract 或在 UI 中重新计算成本。

原因：
成本观测影响路由、限额和平台运营，需要统一口径并能和 trace、audit 对齐。
"""
