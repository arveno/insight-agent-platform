import { Button, Flex, Space, Typography } from "antd";

import type {
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../shared/view-model/staticViewModelTypes";
import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";

import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import type { PlatformOperationsOverviewController } from "../hooks/usePlatformOperationsOverviewState";
import type { PlatformOperationListItemViewModel } from "../models/platformOperationsViewModel";

export type PlatformOperationsSectionsProps = PageRouteProps & {
  controller: PlatformOperationsOverviewController;
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

function buildNavigationActions(
  onNavigate: PlatformOperationsSectionsProps["onNavigate"],
  t: ReturnType<typeof useI18n>["t"]
) {
  return [
    createRouteAction({
      iconName: "dashboard",
      key: "platform-operations-open-dashboard",
      label: t("action.platformOpenDashboard.label"),
      onNavigate,
      route: "dashboard",
      variant: "moduleEntry"
    }),
    createRouteAction({
      iconName: "data",
      key: "platform-operations-open-data-knowledge",
      label: t("action.platformOpenDataKnowledge.label"),
      onNavigate,
      route: "data-knowledge",
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "analysis",
      key: "platform-operations-open-analysis",
      label: t("action.platformOpenAnalysis.label"),
      onNavigate,
      route: "analysis",
      title: t("action.platformOpenAnalysis.description"),
      variant: "contextPrimary"
    })
  ];
}

function OperationListCard({
  description,
  items,
  onSelectOperation,
  selectedOperationKey,
  t,
  title
}: {
  description: string;
  items: PlatformOperationListItemViewModel[];
  onSelectOperation: (key: string) => void;
  selectedOperationKey: string;
  t: ReturnType<typeof useI18n>["t"];
  title: string;
}) {
  return (
    <ContentCard description={description} title={title}>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {items.map((item) => {
          const isSelected = selectedOperationKey === item.key;

          return (
            <Space
              align="start"
              key={item.key}
              size={12}
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <Button
                aria-label={item.title}
                onClick={() => onSelectOperation(item.key)}
                style={{
                  fontWeight: isSelected ? 600 : 500,
                  justifyContent: "flex-start",
                  paddingInline: 0
                }}
                type="text"
              >
                {item.title}
              </Button>
              {buildTagSlot(t, item)}
            </Space>
          );
        })}
      </Space>
    </ContentCard>
  );
}

function SelectedOperationCard({
  controller
}: {
  controller: PlatformOperationsOverviewController;
}) {
  const selectedOperation = controller.viewModel.selectedOperation;

  return (
    <ContentCard
      description={selectedOperation.description}
      title={`当前选中对象详情：${selectedOperation.title}`}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          {selectedOperation.summary}
        </Typography.Text>
        <Typography.Text>category: {selectedOperation.category}</Typography.Text>
        <Typography.Text>workspaceId: {selectedOperation.workspaceId}</Typography.Text>
        {selectedOperation.lastRunText ? (
          <Typography.Text>{selectedOperation.lastRunText}</Typography.Text>
        ) : null}
        {selectedOperation.ownerText ? (
          <Typography.Text>{selectedOperation.ownerText}</Typography.Text>
        ) : null}
        {selectedOperation.impactText ? (
          <Typography.Text type="secondary">{selectedOperation.impactText}</Typography.Text>
        ) : null}
        {selectedOperation.relatedObjects?.map((object) => (
          <Typography.Text key={object.key}>
            {object.label}: {object.value}
          </Typography.Text>
        ))}
      </Space>
    </ContentCard>
  );
}

function StatusSummaryCard({
  description,
  item,
  t
}: {
  description: string;
  item: PlatformOperationListItemViewModel;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <ContentCard description={description} tagSlot={buildTagSlot(t, item)} title={item.title}>
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {item.category}
      </Typography.Text>
    </ContentCard>
  );
}

export function PlatformOperationsSections({
  controller,
  onNavigate
}: PlatformOperationsSectionsProps) {
  const { t } = useI18n();
  const { viewModel } = controller;
  const sectionByKey = Object.fromEntries(
    viewModel.mainSections.map((section) => [section.key, section])
  );
  const jobItems = viewModel.operationItems.filter((item) => item.category === "job");
  const dataQualityItems = viewModel.operationItems.filter(
    (item) => item.category === "data_quality"
  );
  const platformStatusItems = viewModel.operationItems.filter((item) =>
    ["notification", "deployment", "smoke", "migration"].includes(item.category)
  );

  return (
    <SectionStack>
      <PageIntro
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        description={translateKey(t, viewModel.pageDescriptionKey)}
        eyebrow={translateKey(t, sectionByKey["platform-operations-overview"].titleKey)}
        supportingText={`${translateKey(t, "chrome.lastUpdated")}: ${viewModel.lastUpdatedAt}`}
        title={translateKey(t, viewModel.pageTitleKey)}
      >
        {viewModel.summaryCards.map((item) => (
          <ContentCard
            description={item.description}
            key={item.key}
            tagSlot={buildTagSlot(t, item)}
            title={item.label}
          >
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {item.value}
            </Typography.Text>
          </ContentCard>
        ))}
        <ContentCard description={viewModel.workspaceNotice} title="Workspace 绑定">
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              当前展示的是当前 Workspace 的平台与数据链路健康状态。
            </Typography.Text>
            <Typography.Text>
              当前 Workspace：{viewModel.workspaceBinding.workspaceName}
            </Typography.Text>
            <Typography.Text>workspaceId: {viewModel.workspaceBinding.workspaceId}</Typography.Text>
          </Space>
        </ContentCard>
        <ContentCard
          description="当前页面只提供只读健康摘要，不开放任何执行入口。"
          title="只读边界"
        >
          <Typography.Text style={{ display: "block", fontWeight: 600 }}>
            {viewModel.readonlyNotice}
          </Typography.Text>
        </ContentCard>
      </PageIntro>

      <ContentSection
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        title={translateKey(t, sectionByKey["platform-operations-jobs-data-quality"].titleKey)}
      >
        <OperationListCard
          description="当前 Workspace 的 Job 列表只展示任务状态，不执行真实 Job。"
          items={jobItems}
          onSelectOperation={controller.onSelectOperation}
          selectedOperationKey={controller.selectedOperationKey}
          t={t}
          title="Job 列表"
        />
        <OperationListCard
          description="当前 Workspace 的数据质量检查只展示摘要，不执行真实检查。"
          items={dataQualityItems}
          onSelectOperation={controller.onSelectOperation}
          selectedOperationKey={controller.selectedOperationKey}
          t={t}
          title="DataQualityCheck 列表"
        />
        <SelectedOperationCard controller={controller} />
      </ContentSection>

      <ContentSection
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        title={translateKey(t, sectionByKey["platform-operations-status"].titleKey)}
      >
        {platformStatusItems.map((item) => (
          <StatusSummaryCard
            description="只读展示当前 Workspace 的平台状态摘要，不提供执行入口。"
            item={item}
            key={item.key}
            t={t}
          />
        ))}
      </ContentSection>

      <ContentSection
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
        title={translateKey(t, sectionByKey["platform-operations-risk-navigation"].titleKey)}
      >
        <ContentCard
          description="Platform Operations 只承接当前 Workspace 的平台与数据链路健康，不扩展为全租户或全局 SRE 运维后台。"
          title="风险入口"
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              先区分经营异常和平台链路异常，再决定是否进入 Dashboard、Data & Knowledge 或 Analysis。
            </Typography.Text>
            <Typography.Text type="secondary">
              当前页面只提供只读风险解释和跳转入口，不执行 Job、部署、migration、smoke 或手工改库。
            </Typography.Text>
          </Space>
        </ContentCard>
        <ContentCard
          description="这些入口只触发页面导航或 Analysis 新聊天草稿态入口，不创建真实 conversation、run 或 Agent 执行。"
          title="跳转入口"
        >
          <Flex gap={12} wrap>
            {buildNavigationActions(onNavigate, t).map((action) => (
              <NavigationActionButton action={action} key={action.key} />
            ))}
          </Flex>
        </ContentCard>
      </ContentSection>
    </SectionStack>
  );
}
