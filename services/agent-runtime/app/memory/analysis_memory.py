"""职责：
承载分析过程记忆的读写策略位置。

链路位置：
上游是 runtime / agents 的分析上下文；当前模块处理 analysis memory 边界；
下游是 memory repository 和 RunEvent / MemoryItem contract。

边界：
允许记录可复用的分析路径、假设和中间判断；不允许把未验证模型原始输出直接沉淀为长期事实。

原因：
分析记忆用于提高后续分析连续性，但必须控制可信度和来源，避免错误结论被长期放大。
"""
