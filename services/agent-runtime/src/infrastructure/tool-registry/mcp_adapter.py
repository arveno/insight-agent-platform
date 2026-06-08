"""职责：
承载 MCP 外部工具协议适配的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 MCP Adapter 边界；下游是外部 MCP server 或受控 external client。

边界：
允许把外部工具能力适配为内部 ToolDefinition；不允许让 Agent 直接调用未注册的外部工具。

原因：
外部工具必须进入统一权限、风险、超时、审计和 trace 链路，避免形成第二套工具调用体系。
"""
