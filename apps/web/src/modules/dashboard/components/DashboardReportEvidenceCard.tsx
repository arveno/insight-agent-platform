import { Flex, Space, Typography } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";

import type { DashboardReportEvidenceCardProps } from "./dashboardComponentTypes";

export function DashboardReportEvidenceCard(props: DashboardReportEvidenceCardProps) {
  const { onNavigate } = props;
  const { t } = useI18n();

  if (props.kind === "report") {
    const reportActions = [
      createRouteAction({
        iconName: "reports",
        key: `${props.report.nodeId}-view-report`,
        label: t("dashboard.action.viewReports"),
        onNavigate,
        route: "reports",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${props.report.nodeId}-suggestions`,
        label: t("dashboard.action.viewSuggestions"),
        onNavigate,
        route: "analysis",
        routeState: {
          analysisContextPack: createDashboardAnalysisContextPack({
            nodeId: props.report.nodeId,
            suggestedPrompt: `请基于报告《${props.report.title}》继续分析关键证据和后续建议。`,
            viewModel: props.viewModel
          })
        },
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${props.report.nodeId}-context-analysis`,
        label: t("dashboard.action.analyzeWithContext"),
        onNavigate,
        route: "analysis",
        routeState: {
          analysisContextPack: createDashboardAnalysisContextPack({
            nodeId: props.report.nodeId,
            suggestedPrompt: `请基于报告《${props.report.title}》继续分析关键证据和后续建议。`,
            viewModel: props.viewModel
          })
        },
        variant: "contextPrimary"
      })
    ];

    return (
      <ContentCard
        description={props.report.summary}
        eyebrow={t("dashboard.reportEvidence.recentReportEyebrow")}
        footerActions={
          <Flex gap={12} wrap>
            {reportActions.map((action) => (
              <NavigationActionButton action={action} key={action.key} />
            ))}
          </Flex>
        }
        meta={
          <Space wrap>
            {props.report.chips?.map((chip) => (
              <Typography.Text key={chip} type="secondary">
                {chip}
              </Typography.Text>
            ))}
          </Space>
        }
        title={props.report.title}
      />
    );
  }

  const evidenceActions = [
    createRouteAction({
      iconName: "evidence",
      key: `${props.evidence.nodeId}-view-evidence`,
      label: t("dashboard.action.viewEvidence"),
      onNavigate,
      route: "reports",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${props.evidence.nodeId}-context-analysis`,
      label: t("dashboard.action.analyzeWithContext"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: createDashboardAnalysisContextPack({
          nodeId: props.evidence.nodeId,
          suggestedPrompt: `请基于证据《${props.evidence.title}》继续分析它对当前经营判断的影响。`,
          viewModel: props.viewModel
        })
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "data",
      key: `${props.evidence.nodeId}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "trace",
      key: `${props.evidence.nodeId}-trace`,
      label: t("dashboard.action.viewTrace"),
      onNavigate,
      route: "observability",
      variant: "sourceLink"
    })
  ];

  return (
    <ContentCard
      description={props.evidence.summary}
      eyebrow={t("dashboard.reportEvidence.evidenceEyebrow")}
      footerActions={
        <Flex gap={12} wrap>
          {evidenceActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      meta={
        <Space wrap>
          {props.evidence.chips?.map((chip) => (
            <Typography.Text key={chip} type="secondary">
              {chip}
            </Typography.Text>
          ))}
        </Space>
      }
      title={props.evidence.title}
    />
  );
}
