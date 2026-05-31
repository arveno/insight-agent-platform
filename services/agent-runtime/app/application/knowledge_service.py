"""职责：
承载知识库和 RAG 相关用例编排的模块位置。

链路位置：
上游是 API routes 或 ingestion 任务；当前模块编排 knowledge domain；
下游是 vector_store、object_storage 和 contracts。

边界：
允许组织文档、切片和索引任务；不允许把未结构化知识结果直接交给 UI 或报告。

原因：
知识能力需要可追溯、可评估、可重建的处理链路，application 层负责稳定编排边界。
"""
