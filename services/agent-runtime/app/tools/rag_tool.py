"""职责：
承载知识检索和 RAG 工具的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 RAG Tool 边界；下游是 knowledge domain、vector_store 和 source evidence 契约。

边界：
允许按检索契约返回可追溯证据；不允许直接把未结构化检索结果交给 UI 或报告结论。

原因：
分析结论必须能追溯来源，RAG 工具需要在统一链路中产生 SourceEvidence。
"""
