import { Space, Typography, theme } from "antd";

import type { StaticMetricCardViewModel, StaticSummaryItemViewModel } from "../../../app/models";
import { ChartCard, useI18n } from "../../../shared";
import { translateKey } from "../text";

export type StaticChartProps = {
  metrics?: StaticMetricCardViewModel[];
  summary?: StaticSummaryItemViewModel[];
  titleKey: string;
};

export function StaticChart({ metrics = [], summary = [], titleKey }: StaticChartProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const points = [
    ...metrics.map((metric, index) => ({
      key: metric.key,
      label: metric.label,
      value: 80 - index * 12
    })),
    ...summary.map((item, index) => ({ key: item.key, label: item.label, value: 62 - index * 10 }))
  ].slice(0, 5);

  return (
    <ChartCard
      subtitle={translateKey(t, "chart.static.subtitle")}
      title={translateKey(t, titleKey)}
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {points.map((point) => (
          <div key={point.key}>
            <Space style={{ justifyContent: "space-between", width: "100%" }}>
              <Typography.Text>{point.label}</Typography.Text>
              <Typography.Text type="secondary">{point.value}</Typography.Text>
            </Space>
            <div
              style={{
                background: token.colorFillSecondary,
                borderRadius: token.borderRadiusSM,
                height: 8,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  background: token.colorPrimary,
                  height: 8,
                  width: `${Math.max(point.value, 8)}%`
                }}
              />
            </div>
          </div>
        ))}
      </Space>
    </ChartCard>
  );
}
