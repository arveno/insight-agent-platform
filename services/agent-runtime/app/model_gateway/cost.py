"""职责：
承载模型调用成本和 token 用量核算的模块位置。

链路位置：
上游是 Model Gateway 调用结果；当前模块归集成本字段；下游是 observability/cost 和 ModelCall contract。

边界：
允许记录 inputTokens、outputTokens、cost 和 latencyMs；不允许在页面或 Agent 内自行估算模型成本。

原因：
成本是治理和运营指标，必须采用同一口径，避免多处估算导致账务和监控不一致。
"""
