import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

export function getInspectorDisplayTags(node: Pick<InspectorTreeNode, "chips" | "timeRange">): string[] {
  const values = [node.timeRange?.label, ...(node.chips ?? [])].filter(
    (value): value is string => Boolean(value && value.trim().length > 0)
  );

  return [...new Set(values)];
}
