import { Space, Typography } from "antd";

import type { StaticRightAssistSummaryViewModel } from "../../../app/models";
import { RightAssistPanel, RiskBadge, StatusTag, useI18n } from "../../../shared";
import { ActionBar } from "../actions";
import { toRiskBadge, toStatusTag } from "../adapters";
import { translateKey } from "../text";
import type { NavigateToRoute } from "../types";
import { EvidencePanel } from "./EvidencePanel";
import { TracePanel } from "./TracePanel";

export type RightAssistSummaryPanelProps = {
  onNavigate?: NavigateToRoute;
  summary: StaticRightAssistSummaryViewModel;
};

export function RightAssistSummaryPanel({ onNavigate, summary }: RightAssistSummaryPanelProps) {
  const { t } = useI18n();
  const statusTag = summary.status.status === "ready" ? undefined : toStatusTag(t, summary.status);
  const riskBadge = toRiskBadge(t, summary.risk);

  return (
    <RightAssistPanel
      description={translateKey(t, summary.descriptionKey)}
      title={translateKey(t, summary.titleKey)}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space wrap>
          {statusTag ? <StatusTag {...statusTag} /> : null}
          {riskBadge ? <RiskBadge {...riskBadge} /> : null}
        </Space>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>{t("rightAssist.section.contextActions.title")}</Typography.Text>
          <ActionBar actions={summary.links} onNavigate={onNavigate} t={t} />
        </Space>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>{t("rightAssist.section.evidence.title")}</Typography.Text>
          <EvidencePanel items={summary.evidence} />
        </Space>
        {summary.traces ? (
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text strong>{t("rightAssist.section.trace.title")}</Typography.Text>
            <TracePanel items={summary.traces} />
          </Space>
        ) : null}
      </Space>
    </RightAssistPanel>
  );
}
