"""职责：
承载治理与安全用例编排的模块位置。

链路位置：
上游是 API routes、runtime 或工具执行请求；当前模块编排 governance domain；下游是 policy_engine、sql_guard、tool_permission、data_access 和 audit。

边界：
允许组织策略、权限、审计和风险规则用例；不允许由 Agent 或工具自行决定治理结果。

原因：
治理规则需要集中生效并可审计，application 层负责把治理能力纳入标准用例链路。
"""
