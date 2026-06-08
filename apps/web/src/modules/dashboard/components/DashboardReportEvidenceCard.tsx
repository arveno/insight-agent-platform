import { Flex } from "antd";

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
      meta={card.meta}
      title={card.title}
    />
  );
}
