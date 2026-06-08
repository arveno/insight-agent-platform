import { Space, Typography, theme } from "antd";

import { useI18n } from "../i18n/I18nProvider";
import { translateKey } from "../i18n/translateKey";

import { ChartCard } from "./ChartCard";
import type { ChartPointViewModel } from "./chartTypes";

export type StaticChartProps = {
  points?: ChartPointViewModel[];
  titleKey: string;
};

export function StaticChart({ points = [], titleKey }: StaticChartProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const hasPoints = points.length > 0;

  return (
    <ChartCard
      state={
        hasPoints
          ? { kind: "ready" }
          : {
              kind: "empty",
              empty: {
                description: translateKey(t, "state.empty.default.message"),
                title: translateKey(t, "state.empty.default.title")
              }
            }
      }
      subtitle={translateKey(t, "chart.static.subtitle")}
      title={translateKey(t, titleKey)}
    >
      {hasPoints ? (
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
                    width: `${Math.min(Math.max(point.value, 0), 100)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </Space>
      ) : null}
    </ChartCard>
  );
}
