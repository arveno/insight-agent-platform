import { Flex, List, Space, Typography } from "antd";

import type { StaticSummaryItemViewModel } from "../../../app/shell/models/staticViewModelTypes";
import { useI18n } from "../../i18n/I18nProvider";
import { translateKey } from "../../i18n/translateKey";
import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { toRiskBadge, toStatusTag } from "../../utils/viewModelState";
import { EmptyState } from "../feedback/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";

export type AppPropertyListProps = {
  items: StaticSummaryItemViewModel[];
};

export function AppPropertyList({ items }: AppPropertyListProps) {
  const { t } = useI18n();

  if (items.length === 0) {
    return <EmptyState title={translateKey(t, "state.empty.default.title")} />;
  }

  return (
    <List
      dataSource={items}
      renderItem={(item) => {
        const status = toStatusTag(t, item.status);
        const risk = toRiskBadge(t, item.risk);

        return (
          <List.Item key={item.key}>
            <Space
              direction="vertical"
              size={shellThemeTokens.cardContentGap}
              style={{ width: "100%" }}
            >
              <Flex align="start" justify="space-between" wrap="wrap" gap={12}>
                <Space direction="vertical" size={2}>
                  <Typography.Text style={shellTypographyStyles.cardTitle}>
                    {item.label}
                  </Typography.Text>
                  {item.meta ? (
                    <Typography.Text
                      type="secondary"
                      style={shellTypographyStyles.meta}
                    >
                      {item.meta}
                    </Typography.Text>
                  ) : null}
                </Space>
                {status || risk ? (
                  <Space wrap>
                    {status ? <StatusTag {...status} /> : null}
                    {risk ? <RiskBadge {...risk} /> : null}
                  </Space>
                ) : null}
              </Flex>

              <Typography.Text style={shellTypographyStyles.cardValue}>
                {item.value}
              </Typography.Text>

              {item.description ? (
                <Typography.Text
                  type="secondary"
                  style={shellTypographyStyles.cardDescription}
                >
                  {item.description}
                </Typography.Text>
              ) : null}
            </Space>
          </List.Item>
        );
      }}
    />
  );
}
