import { Space } from "antd";

import type { StaticRightAssistSummaryViewModel } from "../../../app/models";
import { RightAssistPanel, StatusTag, useI18n } from "../../../shared";
import { ActionBar } from "../actions";
import { toStatusTag } from "../adapters";
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

  return (
    <RightAssistPanel
      description={translateKey(t, summary.descriptionKey)}
      title={translateKey(t, summary.titleKey)}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <StatusTag {...toStatusTag(t, summary.status)!} />
        <ActionBar actions={summary.links} onNavigate={onNavigate} t={t} />
        <EvidencePanel items={summary.evidence} />
        {summary.traces ? <TracePanel items={summary.traces} /> : null}
      </Space>
    </RightAssistPanel>
  );
}
