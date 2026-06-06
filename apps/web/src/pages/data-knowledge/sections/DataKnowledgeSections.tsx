import { Space, Typography } from "antd";

import type {
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../app/models";
import type { DataKnowledgeOverviewController } from "../../../features/data-knowledge/hooks";
import type {
  DataKnowledgeChunkViewModel,
  DataKnowledgeEvidenceViewModel,
  DataKnowledgeFieldViewModel,
  DataKnowledgeQualityCheckViewModel,
  DataKnowledgeSelectedAssetViewModel,
  DataKnowledgeTableViewModel
} from "../../../features/data-knowledge/models";
import {
  AppActionGroup,
  AppBaseCard,
  AppSection,
  AppSectionStack,
  RiskBadge,
  SourceEvidenceList,
  StatusTag,
  useI18n
} from "../../../shared";
import {
  createRouteAction,
  toRiskBadge,
  toStatusTag,
  translateKey,
  type WebPageProps
} from "../../_shared";

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

function buildAssetActions(
  onNavigate: DataKnowledgeSectionsProps["onNavigate"],
  selectedAsset: DataKnowledgeSelectedAssetViewModel,
  t: ReturnType<typeof useI18n>["t"]
) {
  const actions = [
    createRouteAction({
      iconName: "analysis",
      key: `${selectedAsset.key}-analysis`,
      label: t("action.dataKnowledgeOpenAnalysis.label"),
      onNavigate,
      route: "analysis",
      title: t("action.dataKnowledgeOpenAnalysis.description"),
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "metrics",
      key: `${selectedAsset.key}-metrics`,
      label: t("action.dataKnowledgeOpenMetrics.label"),
      onNavigate,
      route: "metrics",
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "reports",
      key: `${selectedAsset.key}-reports`,
      label: t("action.dataKnowledgeOpenReports.label"),
      onNavigate,
      route: "reports",
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "models",
      key: `${selectedAsset.key}-model-tools`,
      label: t("action.dataKnowledgeOpenModelTools.label"),
      onNavigate,
      route: "model-tools",
      variant: "moduleEntry"
    })
  ];

  return <AppActionGroup actions={actions} />;
}

function OverviewStaticCard({
  description,
  title,
  value
}: {
  description: string;
  title: string;
  value: string;
}) {
  return (
    <AppBaseCard description={description} title={title}>
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>{value}</Typography.Text>
    </AppBaseCard>
  );
}

function AssetSummaryCard({
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
      title={`当前选中资产详情：${selectedAsset.title}`}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          kind: {selectedAsset.kind}
        </Typography.Text>
        <Typography.Text>workspaceId: {selectedAsset.workspaceId}</Typography.Text>
        <Typography.Text>createdAt: {selectedAsset.createdAt}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function DataSourceDetailCard({
  selectedAsset
}: {
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
}) {
  if (!selectedAsset.dataSource) {
    return null;
  }

  return (
    <AppBaseCard
      description="DataSource 只展示标准化资产摘要，不连接真实数据库，也不执行真实 schema sync。"
      title="DataSource 摘要"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          dataSourceId: {selectedAsset.dataSource.dataSourceId}
        </Typography.Text>
        <Typography.Text>sourceType: {selectedAsset.dataSource.sourceType}</Typography.Text>
        <Typography.Text>name: {selectedAsset.dataSource.name}</Typography.Text>
        <Typography.Text>createdAt: {selectedAsset.dataSource.createdAt}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function KnowledgeDocumentDetailCard({
  selectedAsset
}: {
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
}) {
  if (!selectedAsset.knowledgeDocument) {
    return null;
  }

  return (
    <AppBaseCard
      description="KnowledgeDocument 只展示标准化文档摘要，不执行真实上传、解析、切片或索引。"
      title="KnowledgeDocument 摘要"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          knowledgeDocumentId: {selectedAsset.knowledgeDocument.knowledgeDocumentId}
        </Typography.Text>
        <Typography.Text>title: {selectedAsset.knowledgeDocument.title}</Typography.Text>
        <Typography.Text>createdAt: {selectedAsset.knowledgeDocument.createdAt}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function TableListCard({ tables }: { tables: DataKnowledgeTableViewModel[] }) {
  return (
    <AppBaseCard
      description="Schema 信息只读展示，不执行真实同步、真实查询或跨 Workspace 下钻。"
      title="关联数据表"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {tables.map((table) => (
          <Space direction="vertical" key={table.tableId} size={4} style={{ width: "100%" }}>
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {table.tableName}
            </Typography.Text>
            <Typography.Text>tableId: {table.tableId}</Typography.Text>
            <Typography.Text>createdAt: {table.createdAt}</Typography.Text>
            <Typography.Text>{table.fieldCount} fields</Typography.Text>
            <Typography.Text type="secondary">{table.summary}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function FieldListCard({ fields }: { fields: DataKnowledgeFieldViewModel[] }) {
  return (
    <AppBaseCard
      description="字段字典只展示标准化字段语义，不暴露原始表结果或模型原始输出。"
      title="关键字段"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {fields.map((field) => (
          <Space direction="vertical" key={field.fieldId} size={4} style={{ width: "100%" }}>
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {field.fieldName}
            </Typography.Text>
            <Typography.Text>fieldId: {field.fieldId}</Typography.Text>
            <Typography.Text>dataType: {field.dataType}</Typography.Text>
            <Typography.Text type="secondary">{field.summary}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function ChunkListCard({ chunks }: { chunks: DataKnowledgeChunkViewModel[] }) {
  return (
    <AppBaseCard
      description="知识切片只展示脱敏摘要，不展示 raw vector、raw score 或 embedding。"
      title="知识切片"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {chunks.map((chunk) => (
          <Space direction="vertical" key={chunk.knowledgeChunkId} size={4} style={{ width: "100%" }}>
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {chunk.contentPreview}
            </Typography.Text>
            <Typography.Text>knowledgeChunkId: {chunk.knowledgeChunkId}</Typography.Text>
            <Typography.Text>createdAt: {chunk.createdAt}</Typography.Text>
            <Typography.Text type="secondary">{chunk.summary}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function KnowledgeIndexCard({
  chunkCount,
  selectedAsset
}: {
  chunkCount: number;
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
}) {
  if (!selectedAsset.knowledgeDocument) {
    return null;
  }

  return (
    <AppBaseCard
      description="LlamaIndex / Milvus 只作为后续技术承接方向，本页只读展示 indexing 与 RAG readiness 摘要。"
      title="索引与 RAG 准备度"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          chunks: {chunkCount}
        </Typography.Text>
        <Typography.Text>status: ready for reviewed indexing strategy</Typography.Text>
        <Typography.Text>RAG strategy owner: Models & Tools</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function DataSourceSchemaCard({
  fields,
  tables
}: {
  fields: DataKnowledgeFieldViewModel[];
  tables: DataKnowledgeTableViewModel[];
}) {
  return (
    <AppBaseCard
      description="DataSource 侧的 schema 只承接可读目录和可追溯对象，不执行真实 schema sync。"
      title="Schema 摘要"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          tables: {tables.length}
        </Typography.Text>
        <Typography.Text>fields: {fields.length}</Typography.Text>
        <Typography.Text>status: readonly catalog only</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function KnowledgeDocumentSummaryCard({
  chunks,
  selectedAsset
}: {
  chunks: DataKnowledgeChunkViewModel[];
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
}) {
  return (
    <AppBaseCard
      description="KnowledgeDocument 侧承接文档摘要、chunk 目录和 RAG readiness，不执行真实 ingestion。"
      title="知识文档摘要"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          chunks: {chunks.length}
        </Typography.Text>
        <Typography.Text>workspaceId: {selectedAsset.workspaceId}</Typography.Text>
        <Typography.Text>status: readonly chunk catalog</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function EvidenceListCard({
  evidenceItems
}: {
  evidenceItems: DataKnowledgeEvidenceViewModel[];
}) {
  return (
    <AppBaseCard
      description="SourceEvidence 只展示标准化证据对象，不展示 raw API、raw SQL、tool raw output 或模型原文。"
      title="SourceEvidence 列表"
    >
      <SourceEvidenceList
        items={evidenceItems.map((item) => ({
          confidenceText: `confidence: ${item.confidenceText} (${item.confidence.toFixed(2)})`,
          key: item.sourceEvidenceId,
          sourceTypeLabel: `${item.sourceType} · sourceId: ${item.sourceId}`,
          summary: `${item.snippet} · sourceEvidenceId: ${item.sourceEvidenceId} · runId: ${item.runId} · createdAt: ${item.createdAt}`,
          title: item.title
        }))}
      />
    </AppBaseCard>
  );
}

function EvidenceUsageCard({
  evidenceItems,
  selectedAsset
}: {
  evidenceItems: DataKnowledgeEvidenceViewModel[];
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
}) {
  return (
    <AppBaseCard
      description="EvidenceLineage 用于解释这些资产如何被 Analysis / Reports 消费，而不是在本页创建真实 run。"
      title="Evidence 使用方式"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          当前资产的 SourceEvidence 数量：{evidenceItems.length}
        </Typography.Text>
        <Typography.Text>
          Open in Analysis with context 只进入 Analysis 新聊天草稿态，不立即创建 conversation 或 run。
        </Typography.Text>
        <Typography.Text type="secondary">
          当前资产：{selectedAsset.title}
        </Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function QualitySummaryCard({
  qualityChecks,
  t
}: {
  qualityChecks: DataKnowledgeQualityCheckViewModel[];
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description="DataQualityCheck 在本页只展示摘要，真实检查、Job 和重跑入口仍归 Platform Operations。"
      title="DataQualityCheck 摘要"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {qualityChecks.map((qualityCheck) => (
          <Space direction="vertical" key={qualityCheck.dataQualityCheckId} size={4} style={{ width: "100%" }}>
            <Space wrap>
              <Typography.Text style={{ fontWeight: 600 }}>{qualityCheck.title}</Typography.Text>
              {qualityCheck.statusView ? (
                <StatusTag {...toStatusTag(t, qualityCheck.statusView)!} />
              ) : null}
              {qualityCheck.risk ? <RiskBadge {...toRiskBadge(t, qualityCheck.risk)!} /> : null}
            </Space>
            <Typography.Text>dataQualityCheckId: {qualityCheck.dataQualityCheckId}</Typography.Text>
            <Typography.Text>workspaceId: {qualityCheck.workspaceId}</Typography.Text>
            <Typography.Text>status: {qualityCheck.statusLabel}</Typography.Text>
            <Typography.Text>createdAt: {qualityCheck.createdAt}</Typography.Text>
            <Typography.Text type="secondary">{qualityCheck.summary}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function OperationsHandoffCard({
  onNavigate,
  t
}: {
  onNavigate: DataKnowledgeSectionsProps["onNavigate"];
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description="质量、Job、部署、Smoke、Migration 的真实执行和诊断仍在 Platform Operations，不在本页触发。"
      title="Operations 入口"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          Data & Knowledge 页面只负责资产、证据和可信状态总览。
        </Typography.Text>
        <Typography.Text type="secondary">
          RAG Strategy 只跳转 Models & Tools；DataQualityCheck 只跳转 Platform Operations。
        </Typography.Text>
        <AppActionGroup
          actions={[
            createRouteAction({
              iconName: "operations",
              key: "data-knowledge-open-platform-operations",
              label: t("action.dataKnowledgeOpenPlatformOperations.label"),
              onNavigate,
              route: "platform-operations",
              variant: "moduleEntry"
            })
          ]}
        />
      </Space>
    </AppBaseCard>
  );
}

export function DataKnowledgeSections({
  controller,
  onNavigate
}: DataKnowledgeSectionsProps) {
  const { t } = useI18n();
  const { viewModel } = controller;
  const sectionByKey = Object.fromEntries(
    viewModel.mainSections.map((section) => [section.key, section])
  );
  const selectedAsset = viewModel.selectedAsset;

  return (
    <AppSectionStack>
      <AppSection
        columns={3}
        title={translateKey(t, sectionByKey["data-knowledge-overview"].titleKey)}
      >
        {viewModel.summaryCards.map((item) => (
          <AppBaseCard
            description={item.description}
            key={item.key}
            tagSlot={buildTagSlot(t, item)}
            title={item.label}
          >
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {item.value}
            </Typography.Text>
          </AppBaseCard>
        ))}
        <OverviewStaticCard
          description={viewModel.workspaceNotice}
          title="Workspace 绑定"
          value={viewModel.workspaceBinding.workspaceName}
        />
        <OverviewStaticCard
          description={viewModel.readonlyNotice}
          title="只读边界"
          value="只读资产目录与证据总览"
        />
      </AppSection>

      <AppSection
        columns={3}
        title={translateKey(t, sectionByKey["data-knowledge-asset-detail"].titleKey)}
      >
        <AssetSummaryCard selectedAsset={selectedAsset} t={t} />
        {selectedAsset.kind === "data_source" ? (
          <DataSourceDetailCard selectedAsset={selectedAsset} />
        ) : (
          <KnowledgeDocumentDetailCard selectedAsset={selectedAsset} />
        )}
        <AppBaseCard
          description="动作只表示导航入口，不创建真实 conversation、run、schema sync、ingestion 或索引任务。"
          title="资产动作"
        >
          {buildAssetActions(onNavigate, selectedAsset, t)}
        </AppBaseCard>
      </AppSection>

      <AppSection
        columns={3}
        title={translateKey(t, sectionByKey["data-knowledge-schema-chunk"].titleKey)}
      >
        {selectedAsset.kind === "data_source" ? (
          <>
            <DataSourceSchemaCard fields={viewModel.fields} tables={viewModel.tables} />
            <TableListCard tables={viewModel.tables} />
            <FieldListCard fields={viewModel.fields} />
          </>
        ) : (
          <>
            <KnowledgeDocumentSummaryCard
              chunks={viewModel.chunks}
              selectedAsset={selectedAsset}
            />
            <ChunkListCard chunks={viewModel.chunks} />
            <KnowledgeIndexCard
              chunkCount={viewModel.chunks.length}
              selectedAsset={selectedAsset}
            />
          </>
        )}
      </AppSection>

      <AppSection
        columns={2}
        title={translateKey(t, sectionByKey["data-knowledge-evidence-lineage"].titleKey)}
      >
        <EvidenceListCard evidenceItems={viewModel.evidenceItems} />
        <EvidenceUsageCard
          evidenceItems={viewModel.evidenceItems}
          selectedAsset={selectedAsset}
        />
      </AppSection>

      <AppSection
        columns={2}
        title={translateKey(t, sectionByKey["data-knowledge-quality-operations"].titleKey)}
      >
        <QualitySummaryCard qualityChecks={viewModel.qualityChecks} t={t} />
        <OperationsHandoffCard onNavigate={onNavigate} t={t} />
      </AppSection>
    </AppSectionStack>
  );
}
