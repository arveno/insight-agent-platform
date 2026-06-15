import { Typography } from "antd";

import { StatCard } from "../../../shared/ui/cards/StatCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { DashboardStatCardProps } from "./dashboardComponentTypes";

export function DashboardMetricOverview({
  metric,
  viewModel
}: DashboardStatCardProps) {
  const { t } = useI18n();
  const metricDisplay = viewModel.nodeDisplay[metric.nodeId];

  return (
    <StatCard
      description={<Typography.Text type="secondary">{metric.summary}</Typography.Text>}
      meta={
        metric.chips?.length ? (
          <Typography.Text type="secondary">{metric.chips.join(" · ")}</Typography.Text>
        ) : null
      }
      risk={toRiskBadge(t, metricDisplay?.risk)}
      status={toStatusTag(t, metricDisplay?.status)}
      title={metric.title}
      value={metric.value ?? "--"}
    />
  );
}
