import { Space, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { DashboardRiskCardProps } from "./dashboardComponentTypes";

export function DashboardRiskOverview({
  item,
  viewModel
}: DashboardRiskCardProps) {
  const { t } = useI18n();
  const itemDisplay = viewModel.nodeDisplay[item.nodeId];
  const risk = toRiskBadge(t, itemDisplay?.risk);
  const status = toStatusTag(t, itemDisplay?.status);

  return (
    <ContentCard
      description={item.summary}
      eyebrow={t("dashboard.risk.anomalyEyebrow")}
      meta={
        item.chips?.length ? (
          <Typography.Text type="secondary">{item.chips.join(" · ")}</Typography.Text>
        ) : null
      }
      tagSlot={
        risk || status ? (
          <Space wrap>
            {status ? <StatusTag {...status} /> : null}
            {risk ? <RiskBadge {...risk} /> : null}
          </Space>
        ) : null
      }
      title={item.title}
    >
      {itemDisplay?.valueText || itemDisplay?.trendText ? (
        <Typography.Text>
          {[itemDisplay.valueText, itemDisplay.trendText].filter(Boolean).join(" · ")}
        </Typography.Text>
      ) : null}
    </ContentCard>
  );
}
