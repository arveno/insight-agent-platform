import { Col, Row, Typography } from "antd";

import {
  AppActionGroup,
  AppContentCard,
  type AppActionGroupItem,
  RiskBadge,
  useI18n
} from "../../../shared";
import { toRiskBadge } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardQualityPanel({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();

  return (
    <section>
      <DashboardSectionHeader
        actionIcon="operations"
        actionLabel={t("dashboard.action.viewPlatformOperations")}
        actionRoute="platform-operations"
        eyebrow={t("dashboard.quality.eyebrow")}
        onNavigate={onNavigate}
        title={t("dashboard.quality.title")}
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {viewModel.platformQualitySummary.map((item) => {
          const risk = toRiskBadge(t, item.risk);
          const qualityActions: AppActionGroupItem[] = [
            {
              iconName: "operations",
              key: `${item.key}-operations`,
              label: t("dashboard.action.viewPlatformOperations"),
              onClick: () => onNavigate?.("platform-operations"),
              variant: "moduleEntry"
            },
            {
              iconName: "operations",
              key: `${item.key}-job-quality`,
              label: t("dashboard.action.viewJobDataQuality"),
              onClick: () => onNavigate?.("platform-operations"),
              variant: "objectDetail"
            },
            {
              iconName: "analysis",
              key: `${item.key}-platform-anomaly`,
              label: t("dashboard.action.viewPlatformAnomaly"),
              onClick: () => onNavigate?.("analysis"),
              variant: "contextPrimary"
            },
            {
              iconName: "data",
              key: `${item.key}-source`,
              label: t("dashboard.action.viewDataKnowledge"),
              onClick: () => onNavigate?.("data-knowledge"),
              variant: "sourceLink"
            }
          ];

          return (
            <Col key={item.key} xs={24}>
              <AppContentCard
                description={item.description}
                eyebrow={t("dashboard.quality.itemEyebrow")}
                footerActions={<AppActionGroup actions={qualityActions} />}
                tagSlot={risk ? <RiskBadge {...risk} /> : null}
                title={item.label}
              >
                <Typography.Text>{item.value}</Typography.Text>
              </AppContentCard>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}
