import { Space, Typography } from "antd";

import type { StaticRiskViewModel, StaticStatusViewModel } from "../../../shared/view-model/staticViewModelTypes";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { WebPageProps } from "../../../shared/navigation/navigationTypes";

import { AssetRelationshipGraph } from "./AssetRelationshipGraph";
import type { DataKnowledgeOverviewController } from "../hooks/useDataKnowledgeOverviewState";
import type {
  DataKnowledgeRelationshipNodeViewModel,
  DataKnowledgeSelectedAssetViewModel
} from "../models/dataKnowledgeViewModel";

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
    <ContentCard
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
    </ContentCard>
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
    <ContentCard
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
    </ContentCard>
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
    <SectionStack>
      <ContentSection
        eyebrow={t("page.dataKnowledge.section.selectedAsset.eyebrow")}
        title={t("page.dataKnowledge.section.selectedAsset.title")}
      >
        <SelectedAssetHeader selectedAsset={selectedAsset} t={t} />
      </ContentSection>

      <ContentSection
        eyebrow={t("page.dataKnowledge.section.relationship.eyebrow")}
        title={t("page.dataKnowledge.section.relationship.title")}
      >
        <ContentCard description={relationshipGraph.description} title={relationshipTitle}>
          <AssetRelationshipGraph
            graph={relationshipGraph}
            onSelectNode={controller.onSelectNode}
            selectedNodeId={controller.selectedNodeId}
          />
        </ContentCard>
      </ContentSection>

      <ContentSection
        eyebrow={t("page.dataKnowledge.section.nodeDetail.eyebrow")}
        title={t("page.dataKnowledge.section.nodeDetail.title")}
      >
        <SelectedNodeDetailCard selectedNode={controller.selectedNode} t={t} />
      </ContentSection>
    </SectionStack>
  );
}
