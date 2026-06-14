import type { DataNode } from "antd/es/tree";
import { Flex, Space, Tree, Typography } from "antd";

import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { findInspectorTreeNodeById } from "../../../shared/navigation/analysisContextPack";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetricOverview } from "../components/DashboardMetricOverview";
import { DashboardQualityPanel } from "../components/DashboardQualityPanel";
import { DashboardReportEvidenceCard } from "../components/DashboardReportEvidenceCard";
import { DashboardRiskOverview } from "../components/DashboardRiskOverview";
import {
  getDashboardNodeKindLabel,
  getDashboardNodeRiskLabel,
  getDashboardNodeSourceTypeLabel,
  getDashboardNodeStatusLabel,
  getDashboardNodeTrendLabel
} from "../models/dashboardNodeState";
import {
  selectDashboardEvidenceNodes,
  selectDashboardMetricNodes,
  selectDashboardMetricSection,
  selectDashboardQualityNodes,
  selectDashboardQualitySection,
  selectDashboardReportNodes,
  selectDashboardReportEvidenceSection,
  selectDashboardRiskNodes,
  selectDashboardRiskSection,
  selectDashboardRiskSummaryNode
} from "../models/dashboardSelectors";
import type { DashboardSurfaceViewModel } from "../models/dashboardViewModel";

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
  const riskSummaryNode = selectDashboardRiskSummaryNode(viewModel.root);
  const reportNodes = selectDashboardReportNodes(viewModel.root);
  const reportEvidenceSection = selectDashboardReportEvidenceSection(viewModel.root);
  const evidenceNodes = selectDashboardEvidenceNodes(viewModel.root);
  const qualityNodes = selectDashboardQualityNodes(viewModel.root);
  const qualitySection = selectDashboardQualitySection(viewModel.root);
  const openMetricsAction = createRouteAction({
    iconName: "metrics",
    key: "dashboard-section-metrics",
    label: t("dashboard.action.viewMetrics"),
    onNavigate,
    route: "metrics",
    variant: "moduleEntry"
  });
  const openGovernanceAction = createRouteAction({
    iconName: "governance",
    key: "dashboard-section-governance",
    label: t("dashboard.action.viewGovernanceRisk"),
    onNavigate,
    route: "governance",
    variant: "moduleEntry"
  });
  const openReportsAction = createRouteAction({
    iconName: "reports",
    key: "dashboard-section-reports",
    label: t("dashboard.action.viewAllReports"),
    onNavigate,
    route: "reports",
    variant: "moduleEntry"
  });
  const openPlatformOperationsAction = createRouteAction({
    iconName: "operations",
    key: "dashboard-section-platform-operations",
    label: t("dashboard.action.viewPlatformOperations"),
    onNavigate,
    route: "platform-operations",
    variant: "moduleEntry"
  });
  const riskItems = [
    ...riskNodes.map((item) => ({ isRiskSummary: false, item })),
    ...(riskSummaryNode ? [{ isRiskSummary: true, item: riskSummaryNode }] : [])
  ];

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
          extra={<NavigationActionButton action={openMetricsAction} />}
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
          extra={<NavigationActionButton action={openGovernanceAction} />}
          title={riskSection?.title ?? t("dashboard.risk.title")}
        >
          {riskItems.map(({ isRiskSummary, item }) => (
            <DashboardRiskOverview
              isRiskSummary={isRiskSummary}
              item={item}
              key={item.nodeId}
              onNavigate={onNavigate}
              viewModel={viewModel}
            />
          ))}
        </ContentSection>

        <ContentSection
          colProps={{ md: 12, xl: 8, xs: 24 }}
          contentLayout="cards"
          eyebrow={t("dashboard.reportEvidence.eyebrow")}
          extra={<NavigationActionButton action={openReportsAction} />}
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

        <ContentSection
          colProps={{ md: 12, xs: 24 }}
          contentLayout="cards"
          eyebrow={t("dashboard.quality.eyebrow")}
          extra={<NavigationActionButton action={openPlatformOperationsAction} />}
          title={qualitySection?.title ?? t("dashboard.quality.title")}
        >
          {qualityNodes.map((item) => (
            <DashboardQualityPanel
              item={item}
              key={item.nodeId}
              onNavigate={onNavigate}
              viewModel={viewModel}
            />
          ))}
        </ContentSection>
      </DashboardHero>
    </SectionStack>
  );
}

function resolveTreeValue(node: DashboardSurfaceViewModel["root"]): string | null {
  if (node.value) {
    return node.value;
  }

  if (node.children) {
    return `${node.children.length}`;
  }

  return null;
}

function resolveSourceRefSummary(node: DashboardSurfaceViewModel["root"]): string {
  if (!node.sourceRef) {
    return "目录节点";
  }

  switch (node.sourceRef.type) {
    case "metric":
      return node.sourceRef.metricId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
    case "report":
      return node.sourceRef.reportId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
    case "sourceEvidence":
      return (
        node.sourceRef.sourceEvidenceId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type
      );
    case "analysisRun":
      return node.sourceRef.runId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
    case "dataTable":
      return node.sourceRef.tableId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
    case "knowledgeDocument":
      return (
        node.sourceRef.knowledgeDocumentId ??
        getDashboardNodeSourceTypeLabel(node) ??
        node.sourceRef.type
      );
    case "toolCall":
      return node.sourceRef.toolCallId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
    case "modelCall":
      return node.sourceRef.modelCallId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
    case "job":
      return node.sourceRef.jobId ?? getDashboardNodeSourceTypeLabel(node) ?? node.sourceRef.type;
  }
}

function resolveNodeMeta(node: DashboardSurfaceViewModel["root"], selectedTimeRangeLabel: string) {
  return `${getDashboardNodeKindLabel(node)} · ${node.timeRange?.label ?? selectedTimeRangeLabel}`;
}

function resolveSelectedValueLine(node: DashboardSurfaceViewModel["root"]): string | null {
  const value = resolveTreeValue(node);
  const trendLabel = getDashboardNodeTrendLabel(node);

  if (value && trendLabel) {
    return `${value} · ${trendLabel}`;
  }

  return value ?? trendLabel ?? null;
}

function resolveSelectedRiskStatusLine(node: DashboardSurfaceViewModel["root"]): string | null {
  const riskLabel = getDashboardNodeRiskLabel(node);
  const statusLabel = getDashboardNodeStatusLabel(node);
  const parts = [riskLabel, statusLabel].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" · ") : null;
}

function renderTreeNodeTitle(node: DashboardSurfaceViewModel["root"]) {
  if (node.children?.length) {
    return <Typography.Text strong>{`${node.title} ${node.children.length}`}</Typography.Text>;
  }

  const secondaryParts = [
    resolveTreeValue(node),
    getDashboardNodeTrendLabel(node),
    getDashboardNodeRiskLabel(node) ?? getDashboardNodeStatusLabel(node)
  ].filter((part): part is string => Boolean(part));

  return (
    <Flex align="baseline" gap={12} justify="space-between" style={{ width: "100%" }} wrap>
      <Typography.Text>{node.title}</Typography.Text>
      {secondaryParts.length > 0 ? (
        <Typography.Text type="secondary">{secondaryParts.join(" · ")}</Typography.Text>
      ) : null}
    </Flex>
  );
}

function buildDashboardTreeData(nodes: DashboardSurfaceViewModel["root"]["children"]): DataNode[] {
  return (nodes ?? []).map((node) => ({
    children: buildDashboardTreeData(node.children),
    key: node.nodeId,
    title: renderTreeNodeTitle(node)
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
  const selectedNode = findInspectorTreeNodeById(viewModel.root, activeNodeId) ?? viewModel.root;

  return (
    <SidePanel
      description={`${selectedTimeRangeLabel} · ${workspaceName}`}
      title="上下文目录"
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Tree
            expandedKeys={expandedNodeIds.filter((nodeId) => nodeId !== viewModel.root.nodeId)}
            onExpand={(keys) => onExpandNodes(keys.map((key) => String(key)))}
            onSelect={(_, info) => onSelectNode(String(info.node.key))}
            selectedKeys={[selectedNode.nodeId]}
            treeData={buildDashboardTreeData(viewModel.root.children)}
          />
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>当前节点</Typography.Text>
          <Typography.Text strong>{selectedNode.title}</Typography.Text>
          <Typography.Text type="secondary">
            {resolveNodeMeta(selectedNode, selectedTimeRangeLabel)}
          </Typography.Text>
          {resolveSelectedValueLine(selectedNode) ? (
            <Typography.Text>{resolveSelectedValueLine(selectedNode)}</Typography.Text>
          ) : null}
          {resolveSelectedRiskStatusLine(selectedNode) ? (
            <Typography.Text>{resolveSelectedRiskStatusLine(selectedNode)}</Typography.Text>
          ) : null}
          {selectedNode.summary ? (
            <Typography.Text type="secondary">{selectedNode.summary}</Typography.Text>
          ) : null}
          <Space direction="vertical" size={2}>
            <Typography.Text type="secondary">来源引用</Typography.Text>
            <Typography.Text type="secondary">{resolveSourceRefSummary(selectedNode)}</Typography.Text>
          </Space>
        </Space>
      </Space>
    </SidePanel>
  );
}
