"""职责：
承载 Workspace 用例编排的模块位置。

链路位置：
上游是 API routes；当前模块编排 workspace domain；下游是 repository、schemas 和 contract response。

边界：
允许组织工作区创建、查询和状态变更的用例边界；不允许直接解析 raw API response 或直接访问数据库连接。

原因：
Workspace 是多租户和权限边界的基础，需要独立 application 层隔离 API、domain 和 infrastructure。
"""
