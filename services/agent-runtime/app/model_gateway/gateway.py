"""职责：
承载统一模型调用入口，所有 LLM 请求必须经过这里。

链路位置：
上游是 application / runtime / agents 的模型请求；当前模块是 Model Gateway；下游是 routing、provider adapter、cost 和 observability。

边界：
允许统一处理 provider、路由、重试、错误映射和观测字段；不允许业务代码或 Agent 直接调用模型 provider。

原因：
模型调用需要统一成本、延迟、失败和审计口径，避免不同模块形成不可控的模型访问路径。
"""
