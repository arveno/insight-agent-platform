import type { Metric } from "@insight-agent/contracts/generated/typescript";

import { AgentRuntimeClient } from "../client/agentRuntimeClient";

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
