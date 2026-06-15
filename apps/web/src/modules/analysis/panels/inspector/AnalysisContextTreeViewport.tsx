import { useEffect, useMemo, useState } from "react";
import { Button, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { renderAnalysisContextTreeNodeRow } from "./createContextTreeNodeDisplay";

export type AnalysisContextTreeViewportProps = {
  initialPath?: string[];
  onBack?: () => void;
  root: InspectorTreeNode;
  showBack?: boolean;
};

function buildTreeData(args: {
  activeNodeId: string;
  node: InspectorTreeNode;
  pathLookup: Map<string, string[]>;
  path: string[];
}): DataNode {
  const nextPath = [...args.path, args.node.nodeId];
  args.pathLookup.set(args.node.nodeId, nextPath);

  return {
    children: args.node.children?.map((child) =>
      buildTreeData({
        activeNodeId: args.activeNodeId,
        node: child,
        path: nextPath,
        pathLookup: args.pathLookup
      })
    ),
    key: args.node.nodeId,
    title: renderAnalysisContextTreeNodeRow(args.activeNodeId, args.node)
  };
}

function createExpandedKeys(root: InspectorTreeNode, initialPath?: string[]): string[] {
  if (!initialPath?.length) {
    return [root.nodeId];
  }

  return [...new Set([root.nodeId, ...initialPath.slice(0, -1)])];
}

export function AnalysisContextTreeViewport({
  initialPath,
  onBack,
  root,
  showBack = false
}: AnalysisContextTreeViewportProps) {
  const initialActiveNodeId = initialPath?.at(-1) ?? root.nodeId;
  const [activeNodeId, setActiveNodeId] = useState(initialActiveNodeId);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(
    createExpandedKeys(root, initialPath)
  );

  useEffect(() => {
    setActiveNodeId(initialPath?.at(-1) ?? root.nodeId);
    setExpandedNodeIds(createExpandedKeys(root, initialPath));
  }, [initialPath?.join("|"), root.nodeId]);

  const treeModel = useMemo(() => {
    const pathLookup = new Map<string, string[]>();
    const treeData = [
      buildTreeData({
        activeNodeId,
        node: root,
        path: [],
        pathLookup
      })
    ];

    return { pathLookup, treeData };
  }, [activeNodeId, root]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {showBack && onBack ? (
        <Button onClick={onBack} type="default">
          返回上一级
        </Button>
      ) : null}
      <Tree
        aria-label="Analysis context tree viewport"
        expandedKeys={expandedNodeIds}
        onExpand={(keys) => setExpandedNodeIds(keys.map((key) => String(key)))}
        onSelect={(selectedKeys) => {
          const nodeId = String(selectedKeys[0] ?? root.nodeId);
          const nodePath = treeModel.pathLookup.get(nodeId) ?? [root.nodeId];

          setActiveNodeId(nodeId);
          setExpandedNodeIds((current) => [...new Set([...current, ...nodePath.slice(0, -1)])]);
        }}
        selectedKeys={[activeNodeId]}
        treeData={treeModel.treeData}
      />
    </div>
  );
}
