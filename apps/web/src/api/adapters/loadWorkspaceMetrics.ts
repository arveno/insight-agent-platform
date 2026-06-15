import type { Metric } from "@insight-agent/contracts/generated/typescript";

import { AgentRuntimeClient } from "../client/agentRuntimeClient";

/**
 * Runtime `/metrics` 当前返回的是 workspace-scoped metric read model：
 * definition 字段与 seeded current snapshot 字段同包返回。
 *
 * 前端必须在 ViewModel 边界显式区分 definition 与 current snapshot，
 * 不能把这些 seeded snapshot 字段解释成真实 ETL、公式计算或异常检测结果。
 */
export async function loadWorkspaceMetrics(
  client = new AgentRuntimeClient()
): Promise<Metric[]> {
  const response = await client.listMetrics();

  return response.items;
}

export async function loadWorkspaceMetric(
  metricId: string,
  client = new AgentRuntimeClient()
): Promise<Metric> {
  return client.getMetric(metricId);
}
