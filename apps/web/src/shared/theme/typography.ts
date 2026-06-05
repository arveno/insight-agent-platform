import type { CSSProperties } from "react";

import { shellThemeTokens } from "./tokens";

export const shellTypographyStyles = {
  body: {
    fontSize: shellThemeTokens.fontSizeBody,
    lineHeight: 1.5
  },
  buttonLabel: {
    fontSize: shellThemeTokens.fontSizeButton,
    fontWeight: shellThemeTokens.fontWeightMedium,
    lineHeight: 1.3
  },
  cardDescription: {
    fontSize: shellThemeTokens.fontSizeCardLabel,
    lineHeight: 1.45
  },
  cardTitle: {
    fontSize: shellThemeTokens.fontSizeCardTitle,
    fontWeight: shellThemeTokens.fontWeightSemibold,
    lineHeight: 1.35
  },
  cardValue: {
    fontSize: shellThemeTokens.fontSizeCardTitle,
    fontWeight: shellThemeTokens.fontWeightSemibold,
    lineHeight: 1.35
  },
  heroTitle: {
    fontSize: shellThemeTokens.fontSizeHeroTitle,
    fontWeight: shellThemeTokens.fontWeightSemibold,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  },
  meta: {
    fontSize: shellThemeTokens.fontSizeMeta,
    lineHeight: 1.4
  },
  metricValue: {
    fontSize: shellThemeTokens.fontSizeMetricValue,
    fontWeight: shellThemeTokens.fontWeightSemibold,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  },
  navGroupLabel: {
    fontSize: shellThemeTokens.fontSizeMeta,
    fontWeight: shellThemeTokens.fontWeightMedium,
    letterSpacing: "0.02em",
    lineHeight: 1.4,
    textTransform: "uppercase"
  },
  navItem: {
    fontSize: shellThemeTokens.fontSizeNavItem,
    fontWeight: shellThemeTokens.fontWeightMedium,
    lineHeight: 1.35
  },
  pageTitle: {
    fontSize: shellThemeTokens.fontSizePageTitle,
    fontWeight: shellThemeTokens.fontWeightSemibold,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  },
  sectionTitle: {
    fontSize: shellThemeTokens.fontSizeSectionTitle,
    fontWeight: shellThemeTokens.fontWeightSemibold,
    lineHeight: 1.3
  }
} satisfies Record<string, CSSProperties>;
