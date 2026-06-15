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
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
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
  const reportNodes = selectDashboardReportNodes(viewModel.root);
  const reportEvidenceSection = selectDashboardReportEvidenceSection(viewModel.root);
  const evidenceNodes = selectDashboardEvidenceNodes(viewModel.root);
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
      </DashboardHero>
    </SectionStack>
  );
}

const dashboardKindLabels: Record<string, string> = {
  dashboardOverview: "经营总览",
  dataTable: "数据表",
  directory: "目录",
  knowledgeDocument: "知识文档",
  metric: "指标",
  report: "报告",
  riskSignal: "风险信号",
  sourceEvidence: "证据"
};

function mapSourceRefId(sourceRef: DashboardSurfaceViewModel["root"]["sourceRef"]): string | undefined {
  if (!sourceRef) {
    return undefined;
  }

  switch (sourceRef.type) {
    case "analysisRun":
      return sourceRef.runId;
    case "dataTable":
      return sourceRef.tableId;
    case "job":
      return sourceRef.jobId;
    case "knowledgeDocument":
      return sourceRef.knowledgeDocumentId;
    case "metric":
      return sourceRef.metricId;
    case "modelCall":
      return sourceRef.modelCallId;
    case "report":
      return sourceRef.reportId;
    case "sourceEvidence":
      return sourceRef.sourceEvidenceId;
    case "toolCall":
      return sourceRef.toolCallId;
  }
}

function resolveNodeDisplay(
  nodeId: string,
  viewModel: DashboardSurfaceViewModel
) {
  return viewModel.nodeDisplay[nodeId];
}

function resolveNodeValue(node: DashboardSurfaceViewModel["root"], viewModel: DashboardSurfaceViewModel) {
  return resolveNodeDisplay(node.nodeId, viewModel)?.valueText ?? null;
}

function resolveSelectedTrend(
  node: DashboardSurfaceViewModel["root"],
  viewModel: DashboardSurfaceViewModel
): string | null {
  return resolveNodeDisplay(node.nodeId, viewModel)?.trendText ?? null;
}

function resolveSourceRefSummary(
  node: DashboardSurfaceViewModel["root"],
  viewModel: DashboardSurfaceViewModel
): string {
  if (node.nodeId === viewModel.root.nodeId) {
    return "目录节点 / 当前上下文根";
  }

  return (
    resolveNodeDisplay(node.nodeId, viewModel)?.sourceRefId ??
    mapSourceRefId(node.sourceRef) ??
    "目录节点"
  );
}

function resolveNodeMeta(node: DashboardSurfaceViewModel["root"], selectedTimeRangeLabel: string) {
  if ((node.kind === "report" || node.kind === "sourceEvidence") && node.chips?.length) {
    return node.chips.join(" · ");
  }

  return `${dashboardKindLabels[node.kind] ?? node.kind} · ${node.timeRange?.label ?? selectedTimeRangeLabel}`;
}

function renderNodeRiskStatus(
  node: DashboardSurfaceViewModel["root"],
  t: ReturnType<typeof useI18n>["t"],
  viewModel: DashboardSurfaceViewModel
) {
  const display = resolveNodeDisplay(node.nodeId, viewModel);
  const risk = toRiskBadge(t, display?.risk);
  const status = toStatusTag(t, display?.status);

  if (!risk && !status) {
    return null;
  }

  return (
    <Space size={4} wrap>
      {risk ? <RiskBadge {...risk} /> : null}
      {status ? <StatusTag {...status} /> : null}
    </Space>
  );
}

function renderTreeNodeTitle(
  node: DashboardSurfaceViewModel["root"],
  t: ReturnType<typeof useI18n>["t"],
  viewModel: DashboardSurfaceViewModel
) {
  if (node.children?.length) {
    return <Typography.Text strong>{`${node.title} ${node.children.length}`}</Typography.Text>;
  }

  const value = resolveNodeValue(node, viewModel);
  const riskStatus = renderNodeRiskStatus(node, t, viewModel);

  return (
    <Flex align="baseline" gap={12} justify="space-between" style={{ width: "100%" }} wrap>
      <Typography.Text>{node.title}</Typography.Text>
      <Space size={8} wrap>
        {value ? <Typography.Text type="secondary">{value}</Typography.Text> : null}
        {riskStatus}
      </Space>
    </Flex>
  );
}

function buildDashboardTreeData(
  nodes: DashboardSurfaceViewModel["root"][] | undefined,
  t: ReturnType<typeof useI18n>["t"],
  viewModel: DashboardSurfaceViewModel
): DataNode[] {
  return (nodes ?? []).map((node) => ({
    children: buildDashboardTreeData(node.children, t, viewModel),
    key: node.nodeId,
    title: renderTreeNodeTitle(node, t, viewModel)
  }));
}

function resolveSelectedValueLine(
  node: DashboardSurfaceViewModel["root"],
  viewModel: DashboardSurfaceViewModel
): string | null {
  const value = resolveNodeValue(node, viewModel);
  const trend = resolveSelectedTrend(node, viewModel);

  if (value && trend) {
    return `${value} · ${trend}`;
  }

  return value ?? trend;
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
  const selectedNode = findInspectorTreeNodeById(viewModel.root, activeNodeId) ?? viewModel.root;

  return (
    <SidePanel
      description={`${selectedTimeRangeLabel} · ${workspaceName}`}
      title="上下文目录"
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Tree
          expandedKeys={expandedNodeIds}
          onExpand={(keys) => onExpandNodes(keys.map((key) => String(key)))}
          onSelect={(_, info) => onSelectNode(String(info.node.key))}
          selectedKeys={[selectedNode.nodeId]}
          treeData={buildDashboardTreeData([viewModel.root], t, viewModel)}
        />

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>当前节点</Typography.Text>
          <Typography.Text strong>{selectedNode.title}</Typography.Text>
          <Typography.Text type="secondary">
            {resolveNodeMeta(selectedNode, selectedTimeRangeLabel)}
          </Typography.Text>
          {resolveSelectedValueLine(selectedNode, viewModel) ? (
            <Typography.Text>{resolveSelectedValueLine(selectedNode, viewModel)}</Typography.Text>
          ) : null}
          {renderNodeRiskStatus(selectedNode, t, viewModel)}
          {selectedNode.summary ? (
            <Typography.Text type="secondary">{selectedNode.summary}</Typography.Text>
          ) : null}
          <Space direction="vertical" size={2}>
            <Typography.Text type="secondary">来源引用</Typography.Text>
            <Typography.Text type="secondary">
              {resolveSourceRefSummary(selectedNode, viewModel)}
            </Typography.Text>
          </Space>
        </Space>
      </Space>
    </SidePanel>
  );
}
