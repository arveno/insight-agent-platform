import type { ReactNode } from "react";

import { shellThemeTokens } from "../theme/tokens";
import { shellTypographyStyles } from "../theme/typography";
import { EmptyState } from "../ui/states/EmptyState";
import { ErrorState } from "../ui/states/ErrorState";
import { LoadingState } from "../ui/states/LoadingState";
import { CardSurface } from "../ui/surfaces/CardSurface";
import type { ChartCardViewModel } from "./chartTypes";

export type ChartCardProps = ChartCardViewModel & {
  children?: ReactNode;
};

/**
 * 图表基础容器。
 *
 * ChartCard 只承接图表标题、状态和 slot；
 * 具体 series 必须由 feature mapper 产出 ViewModel，不直接消费 raw metric rows。
 */
export function ChartCard({
  actions,
  children,
  legend,
  state = { kind: "ready" },
  subtitle,
  title
}: ChartCardProps) {
  let content: ReactNode = children;

  if (state.kind === "loading") {
    content = <LoadingState {...state.loading} />;
  }

  if (state.kind === "empty") {
    content = <EmptyState {...state.empty} />;
  }

  if (state.kind === "error") {
    content = <ErrorState {...state.error} />;
  }

  return (
    <CardSurface>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: shellThemeTokens.cardContentGap,
          width: "100%"
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            gap: shellThemeTokens.cardContentGap,
            justifyContent: "space-between",
            width: "100%"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={shellTypographyStyles.cardTitle}>{title}</span>
            {subtitle ? (
              <span style={shellTypographyStyles.cardDescription}>{subtitle}</span>
            ) : null}
          </div>
          {actions}
        </div>
        {content}
        {legend}
      </div>
    </CardSurface>
  );
}
