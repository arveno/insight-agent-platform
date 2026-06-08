import { useI18n } from "../i18n/I18nProvider";
import { translateKey } from "../i18n/translateKey";
import { shellThemeTokens } from "../theme/tokens";
import { shellTypographyStyles } from "../theme/typography";

import { ChartCard } from "./ChartCard";
import type { ChartPointViewModel } from "./chartTypes";

export type StaticChartProps = {
  points?: ChartPointViewModel[];
  titleKey: string;
};

export function StaticChart({ points = [], titleKey }: StaticChartProps) {
  const { t } = useI18n();
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%"
          }}
        >
          {points.map((point) => (
            <div key={point.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%"
                }}
              >
                <span style={shellTypographyStyles.cardDescription}>{point.label}</span>
                <span style={shellTypographyStyles.meta}>{point.value}</span>
              </div>
              <div
                style={{
                  background: `${shellThemeTokens.colorActionPrimaryBg}14`,
                  borderRadius: shellThemeTokens.borderRadiusSM,
                  height: 8,
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    background: shellThemeTokens.colorActionPrimaryBg,
                    height: 8,
                    width: `${Math.min(Math.max(point.value, 0), 100)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </ChartCard>
  );
}
