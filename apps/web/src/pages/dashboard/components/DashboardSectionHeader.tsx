import { Flex, Space, Typography } from "antd";

import type { StaticRouteKey } from "../../../app/models";
import { AppActionButton, type IconName } from "../../../shared";
import type { NavigateToRoute } from "../../_shared";

export type DashboardSectionHeaderProps = {
  actionIcon?: IconName;
  actionLabel?: string;
  actionRoute?: StaticRouteKey;
  eyebrow: string;
  onNavigate?: NavigateToRoute;
  title: string;
};

export function DashboardSectionHeader({
  actionIcon,
  actionLabel,
  actionRoute,
  eyebrow,
  onNavigate,
  title
}: DashboardSectionHeaderProps) {
  return (
    <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
      <Space direction="vertical" size={2}>
        <Typography.Text type="secondary">{eyebrow}</Typography.Text>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
      </Space>
      {actionLabel && actionRoute ? (
        <AppActionButton
          iconName={actionIcon}
          onClick={() => onNavigate?.(actionRoute)}
          variant="moduleEntry"
        >
          {actionLabel}
        </AppActionButton>
      ) : null}
    </Flex>
  );
}
