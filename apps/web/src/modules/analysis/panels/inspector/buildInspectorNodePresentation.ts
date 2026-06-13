import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import {
  getInspectorNodeEyebrow,
  getInspectorNodeStatusText
} from "../../models/inspectorTree";

export type InspectorNodePresentation = {
  eyebrow?: string;
  title: string;
  value?: string;
  chips: string[];
  description?: string;
  disabledReason?: string;
  hasChildren: boolean;
  childCount: number;
};

function dedupeChipValues(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim().length > 0)))];
}

export function buildInspectorNodePresentation(
  node: InspectorTreeNode,
  ancestors: InspectorTreeNode[] = []
): InspectorNodePresentation {
  const children = node.children ?? [];
  const inheritedTimeRangeLabels = ancestors.map((ancestor) => ancestor.timeRange?.label);
  const description = node.description ?? node.summary;

  return {
    childCount: children.length,
    chips: dedupeChipValues([
      ...inheritedTimeRangeLabels,
      node.timeRange?.label,
      ...(node.chips ?? [])
    ]),
    description: description?.trim().length ? description : undefined,
    disabledReason: getInspectorNodeStatusText(node) ?? undefined,
    eyebrow: getInspectorNodeEyebrow(node),
    hasChildren: children.length > 0,
    title: node.title,
    value: node.value
  };
}

export function getInspectorPresentationTitle(
  presentation: InspectorNodePresentation,
  options?: { includeChildCount?: boolean }
): string {
  if (options?.includeChildCount && presentation.hasChildren) {
    return `${presentation.title} · ${presentation.childCount} 项`;
  }

  return presentation.title;
}
