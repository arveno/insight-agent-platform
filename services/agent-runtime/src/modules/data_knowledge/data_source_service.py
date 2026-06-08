"""职责：
承载数据源和数据接入用例编排的模块位置。

链路位置：
上游是 API routes；当前模块编排 data_knowledge domain 中的数据源能力；
下游是 repository、external_clients 和 schemas。

边界：
允许组织数据源、表和字段的契约化流转；不允许绕过 data_access governance 直接暴露数据库结构。

原因：
数据接入是分析链路入口，需要在业务域、权限和契约之间形成清晰边界。
"""
