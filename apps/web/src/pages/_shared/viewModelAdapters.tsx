import type { ReactNode } from "react";
import { Badge, Button, Space, Typography } from "antd";

import type {
  StaticActionViewModel,
  StaticEvidenceEntranceViewModel,
  StaticMetricCardViewModel,
  StaticPageStateViewModel,
  StaticReportEntranceViewModel,
  StaticRiskLevel,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticSummaryItemViewModel,
  StaticTraceEntranceViewModel
} from "../../app/models";
import type { RiskBadgeProps, RiskLevel, StatusTagProps } from "../../shared";
import { translateKey, type Translate } from "./text";
import type { NavigateToRoute } from "./types";

const statusToneByKind: Record<StaticStatusViewModel["status"], StatusTagProps["tone"]> = {
  disabled: "default",
  empty: "default",
  error: "error",
  loading: "processing",
  readonly: "default",
  ready: "success",
  risk: "warning",
  success: "success",
  warning: "warning"
};

const riskLevelMap: Record<StaticRiskLevel, RiskLevel> = {
  critical: "critical",
  high: "high",
  low: "low",
  medium: "medium",
  none: "unknown"
};

export function toStatusTag(
  t: Translate,
  status?: StaticStatusViewModel
): StatusTagProps | undefined {
  if (!status) {
    return undefined;
  }

  return {
    label: translateKey(t, status.labelKey),
    tone: statusToneByKind[status.status]
  };
}

export function toRiskBadge(t: Translate, risk?: StaticRiskViewModel): RiskBadgeProps | undefined {
  if (!risk) {
    return undefined;
  }

  return {
    label: risk.titleKey
      ? translateKey(t, risk.titleKey)
      : (risk.title ?? translateKey(t, "risk.unknown.title")),
    level: riskLevelMap[risk.level],
    reason: risk.reason
  };
}

export function actionDescription(t: Translate, action: StaticActionViewModel): string | undefined {
  return action.descriptionKey ? translateKey(t, action.descriptionKey) : action.description;
}

export type ActionBarProps = {
  actions: StaticActionViewModel[];
  onNavigate?: NavigateToRoute;
  t: Translate;
};

export function ActionBar({ actions, onNavigate, t }: ActionBarProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Space wrap>
      {actions.map((action) => (
        <Button
          disabled={action.disabled}
          key={action.key}
          onClick={() => {
            if (action.targetRoute) {
              onNavigate?.(action.targetRoute);
            }
          }}
          title={actionDescription(t, action)}
          type={action.intent === "primary" ? "primary" : "default"}
        >
          {translateKey(t, action.labelKey)}
        </Button>
      ))}
    </Space>
  );
}

export function summaryMeta(item: StaticSummaryItemViewModel): ReactNode {
  return item.meta ? <Typography.Text type="secondary">{item.meta}</Typography.Text> : null;
}

export function summaryDescription(item: StaticSummaryItemViewModel): ReactNode {
  return item.description ? (
    <Typography.Text type="secondary">{item.description}</Typography.Text>
  ) : null;
}

export function metricMeta(metric: StaticMetricCardViewModel): ReactNode {
  return (
    <Space wrap>
      {metric.trendText ? (
        <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
      ) : null}
      {typeof metric.evidenceCount === "number" ? (
        <Badge
          count={metric.evidenceCount}
          overflowCount={99}
          style={{ backgroundColor: "#1677ff" }}
        />
      ) : null}
    </Space>
  );
}

export function toEvidenceItem(item: StaticEvidenceEntranceViewModel) {
  return {
    confidenceText: item.confidenceText,
    key: item.key,
    sourceTypeLabel: item.sourceType,
    summary: item.summary,
    title: item.title
  };
}

export function toTraceItem(t: Translate, item: StaticTraceEntranceViewModel) {
  return {
    description: item.latencyText,
    key: item.key,
    risk: toRiskBadge(t, item.risk),
    status: toStatusTag(t, item.status),
    timestampText: item.eventId,
    title: item.title
  };
}

export function toReportItem(
  t: Translate,
  item: StaticReportEntranceViewModel
): StaticSummaryItemViewModel {
  return {
    description: `${translateKey(t, "table.column.updatedAt")}: ${item.updatedAt}`,
    key: item.key,
    label: item.title,
    status: item.status,
    value: `${translateKey(t, "table.column.evidenceCount")}: ${item.evidenceCount}`
  };
}

export function pageStateTitle(t: Translate, state: StaticPageStateViewModel): string {
  return translateKey(t, state.titleKey);
}

export function pageStateMessage(t: Translate, state: StaticPageStateViewModel): string {
  return translateKey(t, state.messageKey);
}
