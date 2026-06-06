import { Space, Typography } from "antd";

import type {
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../app/models";
import type { DataKnowledgeOverviewController } from "../../../features/data-knowledge/hooks";
import type {
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

function SelectedAssetHeader({
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
        <Typography.Text type="secondary">
          {selectedAsset.kind === "data_source"
            ? "Read-only asset lineage from DataSource to Evidence usage."
            : "Read-only asset lineage from KnowledgeDocument to Evidence usage."}
        </Typography.Text>
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

export function DataKnowledgeSections({ controller }: DataKnowledgeSectionsProps) {
  const { t } = useI18n();
  const { relationshipGraph, selectedAsset } = controller.viewModel;

  return (
    <AppSectionStack>
      <AppSection
        eyebrow="Selected asset"
        title={t("page.dataKnowledge.section.selectedAsset.title")}
      >
        <SelectedAssetHeader selectedAsset={selectedAsset} t={t} />
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
            selectedNodeId={controller.selectedNodeId}
          />
        </AppBaseCard>
      </AppSection>

      <AppSection eyebrow="Selected node" title={t("page.dataKnowledge.section.nodeDetail.title")}>
        <SelectedNodeDetailCard selectedNode={controller.selectedNode} t={t} />
      </AppSection>
    </AppSectionStack>
  );
}
