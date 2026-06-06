import { Space, Typography } from "antd";

import type {
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../app/models";
import type { DataKnowledgeOverviewController } from "../../../features/data-knowledge/hooks";
import type {
  DataKnowledgeEvidenceViewModel,
  DataKnowledgeRelationshipNodeViewModel,
  DataKnowledgeSelectedAssetViewModel
} from "../../../features/data-knowledge/models";
import {
  AppBaseCard,
  AppSection,
  AppSectionStack,
  RiskBadge,
  StatusTag,
  useI18n
} from "../../../shared";
import { toRiskBadge, toStatusTag, type WebPageProps } from "../../_shared";

import { AssetRelationshipGraph } from "./AssetRelationshipGraph";

export type DataKnowledgeSectionsProps = WebPageProps & {
  controller: DataKnowledgeOverviewController;
};

function buildTagSlot(
  t: ReturnType<typeof useI18n>["t"],
  {
    risk,
    status
  }: {
    risk?: StaticRiskViewModel;
    status?: StaticStatusViewModel;
  }
) {
  const statusTag = toStatusTag(t, status);
  const riskBadge = toRiskBadge(t, risk);

  if (!statusTag && !riskBadge) {
    return undefined;
  }

  return (
    <Space wrap>
      {statusTag ? <StatusTag {...statusTag} /> : null}
      {riskBadge ? <RiskBadge {...riskBadge} /> : null}
    </Space>
  );
}

function renderFactRows(
  facts: Array<{
    label: string;
    value: string;
  }>
) {
  return facts.map((fact) => (
    <Typography.Text key={`${fact.label}:${fact.value}`} style={{ display: "block" }}>
      {`${fact.label}: ${fact.value}`}
    </Typography.Text>
  ));
}

function buildSelectedAssetFacts(selectedAsset: DataKnowledgeSelectedAssetViewModel) {
  if (selectedAsset.kind === "data_source" && selectedAsset.dataSource) {
    return [
      { label: "dataSourceId", value: selectedAsset.dataSource.dataSourceId },
      { label: "sourceType", value: selectedAsset.dataSource.sourceType },
      { label: "workspaceId", value: selectedAsset.workspaceId },
      { label: "createdAt", value: selectedAsset.createdAt }
    ];
  }

  return [
    {
      label: "knowledgeDocumentId",
      value: selectedAsset.knowledgeDocument?.knowledgeDocumentId ?? ""
    },
    { label: "workspaceId", value: selectedAsset.workspaceId },
    { label: "createdAt", value: selectedAsset.createdAt },
    { label: "RAG readiness", value: "Ready for reviewed indexing strategy" }
  ];
}

function SelectedAssetCard({
  selectedAsset,
  t
}: {
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description={selectedAsset.summary}
      tagSlot={buildTagSlot(t, selectedAsset)}
      title={selectedAsset.title}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          {selectedAsset.kind === "data_source" ? "DataSource" : "KnowledgeDocument"}
        </Typography.Text>
        {renderFactRows(buildSelectedAssetFacts(selectedAsset))}
      </Space>
    </AppBaseCard>
  );
}

function SelectedNodeDetailCard({
  selectedNode,
  t
}: {
  selectedNode: DataKnowledgeRelationshipNodeViewModel;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description={selectedNode.summary}
      tagSlot={buildTagSlot(t, selectedNode)}
      title={selectedNode.title}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          {selectedNode.kind}
        </Typography.Text>
        {renderFactRows(selectedNode.facts)}
      </Space>
    </AppBaseCard>
  );
}

function EvidenceUsageCard({
  evidenceItems
}: {
  evidenceItems: DataKnowledgeEvidenceViewModel[];
}) {
  return (
    <AppBaseCard
      description="展示当前资产相关证据如何成为 Analysis / Reports 的标准化 SourceEvidence。"
      title="Evidence usage"
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {evidenceItems.map((evidence) => (
          <Space
            direction="vertical"
            key={evidence.sourceEvidenceId}
            size={4}
            style={{ width: "100%" }}
          >
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {evidence.title}
            </Typography.Text>
            <Typography.Text>{`sourceEvidenceId: ${evidence.sourceEvidenceId}`}</Typography.Text>
            <Typography.Text>{`runId: ${evidence.runId}`}</Typography.Text>
            <Typography.Text>{`sourceType: ${evidence.sourceType}`}</Typography.Text>
            <Typography.Text>{`sourceId: ${evidence.sourceId}`}</Typography.Text>
            <Typography.Text>{`confidence: ${evidence.confidenceText}`}</Typography.Text>
            <Typography.Text>{`createdAt: ${evidence.createdAt}`}</Typography.Text>
            {evidence.reportId ? (
              <Typography.Text>{`reportId: ${evidence.reportId}`}</Typography.Text>
            ) : null}
            <Typography.Text type="secondary">{evidence.snippet}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

export function DataKnowledgeSections({ controller }: DataKnowledgeSectionsProps) {
  const { t } = useI18n();
  const { relationshipGraph, selectedAsset } = controller.viewModel;

  return (
    <AppSectionStack>
      <AppSection
        eyebrow="Selected asset"
        title={t("page.dataKnowledge.section.selectedAsset.title")}
      >
        <SelectedAssetCard selectedAsset={selectedAsset} t={t} />
      </AppSection>

      <AppSection
        eyebrow="Relationship"
        title={t("page.dataKnowledge.section.relationship.title")}
        useGrid={false}
      >
        <AppBaseCard
          description={relationshipGraph.description}
          title={
            selectedAsset.kind === "data_source"
              ? "DataSource relationship"
              : "Knowledge document relationship"
          }
        >
          <AssetRelationshipGraph
            graph={relationshipGraph}
            onSelectNode={controller.onSelectNode}
            selectedNodeKey={controller.selectedNodeKey}
          />
        </AppBaseCard>
      </AppSection>

      <AppSection
        eyebrow="Node and evidence"
        title={t("page.dataKnowledge.section.nodeDetail.title")}
      >
        <SelectedNodeDetailCard selectedNode={controller.selectedNode} t={t} />
        <EvidenceUsageCard evidenceItems={controller.viewModel.evidenceItems} />
      </AppSection>
    </AppSectionStack>
  );
}
