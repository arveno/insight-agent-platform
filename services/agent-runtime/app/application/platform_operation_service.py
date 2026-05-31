"""职责：
承载平台运维用例编排的模块位置。

链路位置：
上游是 API routes 或运维入口；当前模块编排 platform_operations domain；下游是 queue、scheduler、cache、backup、restore 和 notifications。

边界：
允许组织任务、通知、备份恢复和数据质量运维入口；不允许在这里实现业务分析逻辑。

原因：
平台运维能力需要独立于业务分析链路，确保部署、排障和运行管理职责清晰。
"""
