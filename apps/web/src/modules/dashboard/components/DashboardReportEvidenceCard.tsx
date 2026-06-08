import { Flex, Space, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";

import type { DashboardReportEvidenceCardProps } from "./dashboardComponentTypes";

export function DashboardReportEvidenceCard({ card }: DashboardReportEvidenceCardProps) {
  return (
    <ContentCard
      description={card.description}
      eyebrow={card.eyebrow}
      footerActions={
        <Flex gap={12} wrap>
          {card.actions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      meta={
        <Space wrap>
          {card.metaItems.map((item) => (
            <Typography.Text key={item} type="secondary">
              {item}
            </Typography.Text>
          ))}
        </Space>
      }
      style={{ flex: "1 1 420px", minWidth: 0 }}
      title={card.title}
    />
  );
}
