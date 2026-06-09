import { Flex, List, Space, Typography } from "antd";

import { useI18n } from "../../i18n/I18nProvider";
import { translateKey } from "../../i18n/translateKey";
import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import type { SharedRiskViewModel, SharedStatusViewModel } from "../../utils/viewModelState";
import { toRiskBadge, toStatusTag } from "../../utils/viewModelState";
import { EmptyState } from "../states/EmptyState";
import { RiskBadge } from "../status/RiskBadge";
import { StatusTag } from "../status/StatusTag";

/**
 * Shared Pattern：PropertyList 的通用 item contract。
 *
 * 用于 label-value 形式的信息展示，不包含业务对象本身。
 * 各模块必须先把业务数据映射成 label、value、status、risk、meta 等通用字段。
 */
export type PropertyListItem = {
  description?: string;
  key: string;
  label: string;
  /** 次级说明信息，不应塞入完整业务对象或原始响应。 */
  meta?: string;
  /** 通用风险 ViewModel，供 shared/ui 转成 RiskBadge。 */
  risk?: SharedRiskViewModel;
  /** 通用状态 ViewModel，供 shared/ui 转成 StatusTag。 */
  status?: SharedStatusViewModel;
  value: string;
};

/**
 * Shared Pattern：PropertyList 的公共 props 契约。
 *
 * 组件只消费已经整理好的通用 item contract。
 * 不解析 raw data，不做排序、过滤、分组或业务判断。
 */
export type PropertyListProps = {
  items: PropertyListItem[];
};

/**
 * Shared Pattern：通用属性列表。
 *
 * 基于 Ant List / Typography 组合，承接 key-value 展示模式。
 * 不知道 SourceEvidence、Report、RunTrace 等业务对象。
 */
export function PropertyList({ items }: PropertyListProps) {
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
                    <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
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
                <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
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
