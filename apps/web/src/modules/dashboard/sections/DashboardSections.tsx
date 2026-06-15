import { Tag, Tree } from "antd";
import type { DataNode } from "antd/es/tree";

import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { renderContextTreeNodeRow } from "../../../shared/view-model/contextTreeNodeDisplay";
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

function buildDashboardTreeData(
  nodes: DashboardSurfaceViewModel["root"][] | undefined,
  activeNodeId: string,
  nodeDisplay: DashboardSurfaceViewModel["nodeDisplay"],
  t: ReturnType<typeof useI18n>["t"]
): DataNode[] {
  return (nodes ?? []).map((node) => ({
    children: buildDashboardTreeData(node.children, activeNodeId, nodeDisplay, t),
    key: node.nodeId,
    title: renderContextTreeNodeRow({ activeNodeId, node, nodeDisplay, t })
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
        treeData={buildDashboardTreeData([viewModel.root], activeNodeId, viewModel.nodeDisplay, t)}
      />
    </SidePanel>
  );
}
