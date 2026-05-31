"""职责：
承载模型调用错误类型和错误映射的模块位置。

链路位置：
上游是 provider adapter 或 routing 失败；当前模块统一错误语义；
下游是 API response、RunEvent 和 ModelCall contract。

边界：
允许定义可观测、可审计的错误分类；不允许直接泄露 provider 原始错误给 UI 或业务对象。

原因：
模型供应商错误格式不同，统一映射可以保证前后端契约稳定和故障排查一致。
"""
