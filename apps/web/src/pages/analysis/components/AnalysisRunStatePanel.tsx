import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import type { StaticSummaryItemViewModel } from "../../../app/models";
import {
  AppActionGroup,
  AppBaseCard,
  AppSection,
  ErrorState,
  LoadingState,
  RiskBadge,
  StatusTag,
  useI18n
} from "../../../shared";
import { toRiskBadge, toStatusTag } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { AnalysisComponentProps } from "./analysisComponentTypes";

export function AnalysisRunStatePanel({ onNavigate, viewModel }: AnalysisComponentProps) {
  const { t } = useI18n();

  return (
    <AppSection
      columns={4}
      eyebrow={t("analysis.run.sectionEyebrow")}
      title={t("analysis.run.sectionTitle")}
    >
      <RunStateCard
        actions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "trace",
                key: "analysis-run-view-trace",
                label: t("analysis.action.viewTrace"),
                onNavigate,
                route: "observability",
                variant: "sourceLink"
              })
            ]}
          />
        }
        description={t("analysis.run.current.description")}
        item={viewModel.runStatus}
        title={t("analysis.run.current.title")}
      />
      <RunStateCard
        actions={
          <AppActionGroup
            actions={[
              createRouteAction({
                disabled: true,
                iconName: "governance",
                key: "analysis-approval-open",
                label: t("analysis.action.viewApproval"),
                title: t("analysis.approval.disabledReason"),
                variant: "objectDetail"
              })
            ]}
          />
        }
        description={t("analysis.approval.description")}
        item={viewModel.approvalState}
        title={t("analysis.approval.title")}
      />
      <RunStateCard
        description={t("analysis.streaming.description")}
        item={viewModel.streamingState}
        title={t("analysis.streaming.title")}
      >
        <LoadingState label={t("analysis.streaming.loadingLabel")} />
      </RunStateCard>
      <RunStateCard
        actions={
          <AppActionGroup
            actions={[
              createRouteAction({
                disabled: true,
                iconName: "trace",
                key: "analysis-retry-action",
                label: t("analysis.action.retry"),
                title: t("analysis.retry.disabledReason"),
                variant: "objectDetail"
              })
            ]}
          />
        }
        description={t("analysis.retry.description")}
        item={viewModel.retryState}
        title={t("analysis.retry.title")}
      >
        <ErrorState description={t("analysis.retry.errorDescription")} title={t("analysis.retry.errorTitle")} />
      </RunStateCard>
    </AppSection>
  );
}

function RunStateCard({
  actions,
  children,
  description,
  item,
  title
}: {
  actions?: ReactNode;
  children?: ReactNode;
  description: string;
  item: StaticSummaryItemViewModel;
  title: string;
}) {
  const { t } = useI18n();
  const statusTag = item.status?.status === "ready" ? undefined : toStatusTag(t, item.status);
  const riskBadge = toRiskBadge(t, item.risk);

  return (
    <AppBaseCard
      eyebrow={item.label}
      footerActions={actions}
      tagSlot={
        <Space wrap size={4}>
          {statusTag ? <StatusTag {...statusTag} /> : null}
          {riskBadge ? <RiskBadge {...riskBadge} /> : null}
        </Space>
      }
      title={title}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text>{description}</Typography.Text>
        {children ? children : <Typography.Text type="secondary">{item.description}</Typography.Text>}
      </Space>
    </AppBaseCard>
  );
}
