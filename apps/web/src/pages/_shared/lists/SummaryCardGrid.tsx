import { Typography } from "antd";

import type { StaticSummaryItemViewModel } from "../../../app/models";
import { CardList, shellTypographyStyles, useI18n } from "../../../shared";
import { toRiskBadge, toStatusTag } from "../adapters";
import { translateKey } from "../text";

export type SummaryCardGridProps = {
  items: StaticSummaryItemViewModel[];
};

export function SummaryCardGrid({ items }: SummaryCardGridProps) {
  const { t } = useI18n();

  return (
    <CardList
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => ({
        description: item.description ? (
          <Typography.Text type="secondary">{item.description}</Typography.Text>
        ) : null,
        key: item.key,
        meta: item.meta ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {item.meta}
          </Typography.Text>
        ) : null,
        risk: toRiskBadge(t, item.risk),
        status: toStatusTag(t, item.status),
        title: item.label,
        extra: (
          <Typography.Text style={shellTypographyStyles.cardValue}>{item.value}</Typography.Text>
        )
      }))}
    />
  );
}
