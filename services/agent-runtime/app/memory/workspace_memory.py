"""职责：
承载工作区级长期记忆的读写策略位置。

链路位置：
上游是 Memory Tool 或 workspace application 用例；当前模块处理 workspace memory 边界；下游是 memory repository 和 MemoryItem contract。

边界：
允许记录工作区稳定背景、业务偏好和共享上下文；不允许混入单个用户私有偏好。

原因：
工作区记忆会被多个用户和分析任务复用，需要独立边界以避免跨用户语义污染。
"""
