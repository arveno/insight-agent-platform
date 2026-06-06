import { Space, Typography, theme } from "antd";

import type { StaticRiskViewModel, StaticStatusViewModel } from "../../../app/models/staticViewModelTypes";
import type { DataKnowledgeOverviewController } from "../../../features/data-knowledge/hooks/useDataKnowledgeOverviewState";
import { AppActionGroup } from "../../../shared/ui/actions/AppActionGroup";
import { RightAssistPanel } from "../../../shared/layout/shell/RightAssistPanel";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../_shared/actions/createRouteAction";
import { toRiskBadge, toStatusTag } from "../../_shared/adapters/viewModelAdapters";
import type { NavigateToRoute } from "../../_shared/types";

export type DataKnowledgeInspectorPanelProps = {
  controller: DataKnowledgeOverviewController;
  onNavigate?: NavigateToRoute;
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
    return null;
  }

  return (
    <Space wrap>
      {statusTag ? <StatusTag {...statusTag} /> : null}
      {riskBadge ? <RiskBadge {...riskBadge} /> : null}
    </Space>
  );
}

export function DataKnowledgeInspectorPanel({
  controller,
  onNavigate
}: DataKnowledgeInspectorPanelProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const { selectedAsset, summaryCards, qualityChecks, readonlyBoundaryItems, technicalBoundaryItems } =
    controller.viewModel;

  return (
    <RightAssistPanel
      description={t("page.dataKnowledge.rightAssist.description")}
      title={t("page.dataKnowledge.rightAssist.title")}
    >
      <Space direction="vertical" size={shellThemeTokens.shellSectionGap} style={{ width: "100%" }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("page.dataKnowledge.inspector.workspace.title")}
          </Typography.Text>
          {summaryCards.map((item) => (
            <Typography.Text
              key={item.key}
              style={{ ...shellTypographyStyles.meta, color: token.colorTextDescription }}
            >
              {`${item.label}: ${item.value}`}
            </Typography.Text>
          ))}
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("page.dataKnowledge.inspector.readonly.title")}
          </Typography.Text>
          {readonlyBoundaryItems.map((item) => (
            <Typography.Text
              key={item}
              style={{ ...shellTypographyStyles.cardDescription, color: token.colorTextDescription }}
            >
              {`• ${item}`}
            </Typography.Text>
          ))}
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("page.dataKnowledge.inspector.quality.title")}
          </Typography.Text>
          {qualityChecks.map((qualityCheck) => (
            <Space
              direction="vertical"
              key={qualityCheck.dataQualityCheckId}
              size={4}
              style={{ width: "100%" }}
            >
              <Space wrap style={{ width: "100%" }}>
                <Typography.Text style={shellTypographyStyles.cardTitle}>
                  {qualityCheck.title}
                </Typography.Text>
                {buildTagSlot(t, {
                  risk: qualityCheck.risk,
                  status: qualityCheck.statusView
                })}
              </Space>
              <Typography.Text
                style={{ ...shellTypographyStyles.meta, color: token.colorTextDescription }}
              >
                {`dataQualityCheckId: ${qualityCheck.dataQualityCheckId}`}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={shellTypographyStyles.cardDescription}
              >
                {qualityCheck.summary}
              </Typography.Text>
            </Space>
          ))}
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "operations",
                key: `${selectedAsset.key}-quality-platform-operations`,
                label: t("action.dataKnowledgeOpenPlatformOperations.label"),
                onNavigate,
                route: "platform-operations",
                variant: "moduleEntry"
              })
            ]}
          />
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("page.dataKnowledge.inspector.actions.title")}
          </Typography.Text>
          <AppActionGroup
            actions={[
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
              }),
              createRouteAction({
                iconName: "operations",
                key: `${selectedAsset.key}-platform-operations`,
                label: t("action.dataKnowledgeOpenPlatformOperations.label"),
                onNavigate,
                route: "platform-operations",
                variant: "moduleEntry"
              })
            ]}
          />
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("page.dataKnowledge.inspector.technical.title")}
          </Typography.Text>
          {technicalBoundaryItems.map((item) => (
            <Typography.Text
              key={item}
              style={{ ...shellTypographyStyles.cardDescription, color: token.colorTextDescription }}
            >
              {`• ${item}`}
            </Typography.Text>
          ))}
        </Space>
      </Space>
    </RightAssistPanel>
  );
}
