import type { ReactNode } from "react";
import { Tag, Tree } from "antd";
import type { DataNode } from "antd/es/tree";

import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { ContextTreeNodeRow } from "../../../shared/ui/lists/ContextTreeNodeRow";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import { createContextSourceMetaText } from "../../../shared/view-model/contextSourceDisplay";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetricOverview } from "../components/DashboardMetricOverview";
import { DashboardReportEvidenceCard } from "../components/DashboardReportEvidenceCard";
import { DashboardRiskOverview } from "../components/DashboardRiskOverview";
import {
  selectDashboardEvidenceNodes,
  selectDashboardMetricNodes,
  selectDashboardMetricSection,
  selectDashboardReportNodes,
  selectDashboardReportEvidenceSection,
  selectDashboardRiskNodes,
  selectDashboardRiskSection
} from "../models/dashboardSelectors";
import type {
  DashboardNodeDisplayViewModel,
  DashboardSurfaceViewModel
} from "../models/dashboardViewModel";

export type DashboardSectionsProps = PageRouteProps & {
  onTimeRangeChange: (key: DashboardSurfaceViewModel["timeRange"]["selectedKey"]) => void;
  selectedTimeRange: DashboardSurfaceViewModel["timeRange"]["options"][number];
  selectedTimeRangeKey: DashboardSurfaceViewModel["timeRange"]["selectedKey"];
  viewModel: DashboardSurfaceViewModel;
};

export type DashboardInspectorPanelProps = {
  activeNodeId: string;
  expandedNodeIds: string[];
  onExpandNodes: (nodeIds: string[]) => void;
  onSelectNode: (nodeId: string) => void;
  selectedTimeRangeLabel: string;
  viewModel: DashboardSurfaceViewModel;
  workspaceName: string;
};

export function DashboardSections({
  onNavigate,
  onTimeRangeChange,
  selectedTimeRange,
  selectedTimeRangeKey,
  viewModel
}: DashboardSectionsProps) {
  const { t } = useI18n();
  const metricNodes = selectDashboardMetricNodes(viewModel.root);
  const metricSection = selectDashboardMetricSection(viewModel.root);
  const riskNodes = selectDashboardRiskNodes(viewModel.root);
  const riskSection = selectDashboardRiskSection(viewModel.root);
  const reportNodes = selectDashboardReportNodes(viewModel.root);
  const reportEvidenceSection = selectDashboardReportEvidenceSection(viewModel.root);
  const evidenceNodes = selectDashboardEvidenceNodes(viewModel.root);

  return (
    <SectionStack>
      <DashboardHero
        onNavigate={onNavigate}
        onTimeRangeChange={onTimeRangeChange}
        selectedTimeRange={selectedTimeRange}
        selectedTimeRangeKey={selectedTimeRangeKey}
        viewModel={viewModel}
      >
        <ContentSection
          colProps={{ md: 12, xs: 24 }}
          contentLayout="cards"
          eyebrow={t("dashboard.metrics.eyebrow")}
          title={metricSection?.title ?? t("dashboard.metrics.title")}
        >
          {metricNodes.map((metric) => (
            <DashboardMetricOverview
              key={metric.nodeId}
              metric={metric}
              onNavigate={onNavigate}
              timeRange={selectedTimeRange}
              viewModel={viewModel}
            />
          ))}
        </ContentSection>

        <ContentSection
          colProps={{ md: 12, xs: 24 }}
          contentLayout="cards"
          eyebrow={t("dashboard.risk.eyebrow")}
          title={riskSection?.title ?? t("dashboard.risk.title")}
        >
          {riskNodes.map((item) => (
            <DashboardRiskOverview
              item={item}
              key={item.nodeId}
              onNavigate={onNavigate}
              viewModel={viewModel}
            />
          ))}
        </ContentSection>

        <ContentSection
          colProps={{ md: 12, xs: 24 }}
          contentLayout="cards"
          eyebrow={t("dashboard.reportEvidence.eyebrow")}
          title={reportEvidenceSection?.title ?? t("dashboard.reportEvidence.title")}
        >
          {reportNodes.map((report) => (
            <DashboardReportEvidenceCard
              key={report.nodeId}
              kind="report"
              onNavigate={onNavigate}
              report={report}
              viewModel={viewModel}
            />
          ))}
          {evidenceNodes.map((evidence) => (
            <DashboardReportEvidenceCard
              evidence={evidence}
              key={evidence.nodeId}
              kind="evidence"
              onNavigate={onNavigate}
              viewModel={viewModel}
            />
          ))}
        </ContentSection>
      </DashboardHero>
    </SectionStack>
  );
}

function resolveNodeDisplay(
  nodeId: string,
  viewModel: DashboardSurfaceViewModel
): DashboardNodeDisplayViewModel | undefined {
  return viewModel.nodeDisplay[nodeId];
}

function resolveCompactValueText(
  nodeId: string,
  viewModel: DashboardSurfaceViewModel
): string | undefined {
  const display = resolveNodeDisplay(nodeId, viewModel);
  const parts = [display?.valueText, display?.trendText].filter(Boolean);

  return parts.length ? parts.join(" · ") : undefined;
}

function renderNodeBadges(
  nodeId: string,
  t: ReturnType<typeof useI18n>["t"],
  viewModel: DashboardSurfaceViewModel
): ReactNode {
  const display = resolveNodeDisplay(nodeId, viewModel);
  const risk = toRiskBadge(t, display?.risk);
  const status = toStatusTag(t, display?.status);

  if (!risk && !status) {
    return null;
  }

  return (
    <>
      {status ? <StatusTag {...status} /> : null}
      {risk ? <RiskBadge {...risk} /> : null}
    </>
  );
}

function createRootSecondaryText(viewModel: DashboardSurfaceViewModel): string {
  const metricCount = selectDashboardMetricNodes(viewModel.root).length;
  const riskCount = selectDashboardRiskNodes(viewModel.root).length;
  const evidenceCount =
    selectDashboardReportNodes(viewModel.root).length + selectDashboardEvidenceNodes(viewModel.root).length;

  return `${metricCount} 指标 · ${riskCount} 风险 · ${evidenceCount} 证据`;
}

function createDashboardContextTreeNodeDisplay(args: {
  activeNodeId: string;
  node: DashboardSurfaceViewModel["root"];
  t: ReturnType<typeof useI18n>["t"];
  viewModel: DashboardSurfaceViewModel;
}) {
  const { activeNodeId, node, t, viewModel } = args;
  const selected = activeNodeId === node.nodeId;

  if (node.nodeId === viewModel.root.nodeId) {
    return {
      secondaryText: createRootSecondaryText(viewModel),
      selected,
      title: node.title
    };
  }

  if (node.kind === "directory") {
    return {
      count: node.children?.length ?? 0,
      selected,
      title: node.title
    };
  }

  if (node.kind === "metric" || node.kind === "riskSignal") {
    return {
      badges: renderNodeBadges(node.nodeId, t, viewModel),
      secondaryText: resolveCompactValueText(node.nodeId, viewModel),
      selected,
      title: node.title
    };
  }

  return {
    secondaryText: createContextSourceMetaText(t, node.chips ?? []),
    selected,
    title: node.title
  };
}

function renderTreeNodeTitle(
  node: DashboardSurfaceViewModel["root"],
  activeNodeId: string,
  t: ReturnType<typeof useI18n>["t"],
  viewModel: DashboardSurfaceViewModel
) {
  return (
    <ContextTreeNodeRow
      {...createDashboardContextTreeNodeDisplay({ activeNodeId, node, t, viewModel })}
    />
  );
}

function buildDashboardTreeData(
  nodes: DashboardSurfaceViewModel["root"][] | undefined,
  activeNodeId: string,
  t: ReturnType<typeof useI18n>["t"],
  viewModel: DashboardSurfaceViewModel
): DataNode[] {
  return (nodes ?? []).map((node) => ({
    children: buildDashboardTreeData(node.children, activeNodeId, t, viewModel),
    key: node.nodeId,
    title: renderTreeNodeTitle(node, activeNodeId, t, viewModel)
  }));
}

export function DashboardInspectorPanel({
  activeNodeId,
  expandedNodeIds,
  onExpandNodes,
  onSelectNode,
  selectedTimeRangeLabel,
  viewModel,
  workspaceName
}: DashboardInspectorPanelProps) {
  const { t } = useI18n();

  return (
    <SidePanel
      description={
        <span style={{ columnGap: 8, display: "inline-flex", flexWrap: "wrap", rowGap: 8 }}>
          <Tag bordered={false}>{selectedTimeRangeLabel}</Tag>
          <Tag bordered={false}>{workspaceName}</Tag>
        </span>
      }
      title="上下文目录"
    >
      <Tree
        expandedKeys={expandedNodeIds}
        onExpand={(keys) => onExpandNodes(keys.map((key) => String(key)))}
        onSelect={(_, info) => onSelectNode(String(info.node.key))}
        selectedKeys={[activeNodeId]}
        treeData={buildDashboardTreeData([viewModel.root], activeNodeId, t, viewModel)}
      />
    </SidePanel>
  );
}
