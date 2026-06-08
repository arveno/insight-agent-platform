import { Space, Typography } from "antd";

import type { StaticRiskViewModel, StaticStatusViewModel } from "../../../app/models/staticViewModelTypes";
import type { DataKnowledgeOverviewController } from "../../../features/data-knowledge/hooks/useDataKnowledgeOverviewState";
import type { DataKnowledgeRelationshipNodeViewModel, DataKnowledgeSelectedAssetViewModel } from "../../../features/data-knowledge/models/dataKnowledgeViewModel";
import { AppBaseCard } from "../../../shared/ui/cards/AppBaseCard";
import { AppSection } from "../../../shared/layout/sections/AppSection";
import { AppSectionStack } from "../../../shared/layout/sections/AppSectionStack";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toRiskBadge, toStatusTag } from "../../_shared/adapters/viewModelAdapters";
import type { WebPageProps } from "../../_shared/types";

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
  const assetKindLabel =
    selectedAsset.kind === "data_source"
      ? t("page.dataKnowledge.assetKind.dataSourceFull")
      : t("page.dataKnowledge.assetKind.knowledgeDocumentFull");
  const lineageDescription =
    selectedAsset.kind === "data_source"
      ? t("page.dataKnowledge.selectedAsset.dataSourceLineage")
      : t("page.dataKnowledge.selectedAsset.knowledgeDocumentLineage");

  return (
    <AppBaseCard
      description={selectedAsset.summary}
      tagSlot={buildTagSlot(t, selectedAsset)}
      title={selectedAsset.title}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          {assetKindLabel}
        </Typography.Text>
        <Typography.Text type="secondary">{lineageDescription}</Typography.Text>
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
  const relationshipTitle =
    selectedAsset.kind === "data_source"
      ? t("page.dataKnowledge.relationship.dataSourceTitle")
      : t("page.dataKnowledge.relationship.knowledgeDocumentTitle");

  return (
    <AppSectionStack>
      <AppSection
        eyebrow={t("page.dataKnowledge.section.selectedAsset.eyebrow")}
        title={t("page.dataKnowledge.section.selectedAsset.title")}
      >
        <SelectedAssetHeader selectedAsset={selectedAsset} t={t} />
      </AppSection>

      <AppSection
        eyebrow={t("page.dataKnowledge.section.relationship.eyebrow")}
        title={t("page.dataKnowledge.section.relationship.title")}
        useGrid={false}
      >
        <AppBaseCard description={relationshipGraph.description} title={relationshipTitle}>
          <AssetRelationshipGraph
            graph={relationshipGraph}
            onSelectNode={controller.onSelectNode}
            selectedNodeId={controller.selectedNodeId}
          />
        </AppBaseCard>
      </AppSection>

      <AppSection
        eyebrow={t("page.dataKnowledge.section.nodeDetail.eyebrow")}
        title={t("page.dataKnowledge.section.nodeDetail.title")}
      >
        <SelectedNodeDetailCard selectedNode={controller.selectedNode} t={t} />
      </AppSection>
    </AppSectionStack>
  );
}
