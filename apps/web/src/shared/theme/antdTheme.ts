import { theme, type ThemeConfig } from "antd";

import { shellThemeTokens } from "./tokens";
import type { ResolvedThemeMode } from "./themeTypes";

const baseToken = {
  borderRadius: shellThemeTokens.borderRadius,
  borderRadiusLG: shellThemeTokens.borderRadiusLG,
  borderRadiusSM: shellThemeTokens.borderRadiusSM,
  boxShadow: "none",
  boxShadowSecondary: "none",
  boxShadowTertiary: "none",
  controlHeight: 32,
  controlHeightSM: 26,
  fontSize: shellThemeTokens.fontSizeBody,
  fontSizeHeading1: shellThemeTokens.fontSizePageTitle,
  fontSizeHeading2: shellThemeTokens.fontSizeHeroTitle,
  fontSizeHeading3: 20,
  fontSizeHeading4: shellThemeTokens.fontSizeSectionTitle,
  fontSizeHeading5: shellThemeTokens.fontSizeCardTitle,
  fontSizeLG: shellThemeTokens.fontSizeSectionTitle,
  fontSizeSM: shellThemeTokens.fontSizeMeta,
  fontWeightStrong: shellThemeTokens.fontWeightSemibold,
  lineHeight: 1.5,
  lineHeightLG: 1.4,
  lineHeightSM: 1.4
} satisfies ThemeConfig["token"];

const lightPalette = {
  colorBgContainer: "#FFFFFF",
  colorBgElevated: "#FFFFFF",
  colorBgLayout: "#FCFCFC",
  colorBorder: "#E5E5E5",
  colorBorderSecondary: "#EDEDED",
  colorFillSecondary: "#F4F4F5",
  colorFillTertiary: "#FAFAFA",
  colorText: "#111111",
  colorTextDescription: "#737373",
  colorTextSecondary: "#525252"
} as const;

const lightToken = {
  ...baseToken,
  ...lightPalette,
  colorBgSolid: shellThemeTokens.colorActionPrimaryBg,
  colorBgSolidActive: shellThemeTokens.colorActionPrimaryBgActive,
  colorBgSolidHover: shellThemeTokens.colorActionPrimaryBgHover,
  colorLink: shellThemeTokens.colorLink,
  colorLinkActive: shellThemeTokens.colorLinkActive,
  colorLinkHover: shellThemeTokens.colorLinkHover,
  colorPrimary: shellThemeTokens.colorActionPrimaryBg,
  colorPrimaryActive: shellThemeTokens.colorActionPrimaryBgActive,
  colorPrimaryBg: lightPalette.colorFillSecondary,
  colorPrimaryBgHover: "#EFEFEF",
  colorPrimaryBorder: lightPalette.colorBorder,
  colorPrimaryHover: shellThemeTokens.colorActionPrimaryBgHover,
  colorPrimaryText: shellThemeTokens.colorLink,
  colorPrimaryTextActive: shellThemeTokens.colorLinkActive,
  colorPrimaryTextHover: shellThemeTokens.colorLinkHover,
  controlItemBgActive: lightPalette.colorFillSecondary,
  controlItemBgActiveHover: "#F0F0F0"
} satisfies ThemeConfig["token"];

const darkPalette = {
  colorBgContainer: "#0A0A0A",
  colorBgElevated: "#111111",
  colorBgLayout: "#000000",
  colorBorder: "#2A2A2A",
  colorBorderSecondary: "#1F1F1F",
  colorFillSecondary: "#111111",
  colorFillTertiary: "#0A0A0A",
  colorText: "#EDEDED",
  colorTextDescription: "#737373",
  colorTextSecondary: "#A3A3A3"
} as const;

const darkToken = {
  ...baseToken,
  ...darkPalette,
  colorBgSolid: shellThemeTokens.colorActionPrimaryBg,
  colorBgSolidActive: shellThemeTokens.colorActionPrimaryBgActive,
  colorBgSolidHover: shellThemeTokens.colorActionPrimaryBgHover,
  colorLink: "#60a5fa",
  colorLinkActive: "#93c5fd",
  colorLinkHover: "#7dd3fc",
  colorPrimary: shellThemeTokens.colorActionPrimaryBg,
  colorPrimaryActive: shellThemeTokens.colorActionPrimaryBgActive,
  colorPrimaryBg: darkPalette.colorFillSecondary,
  colorPrimaryBgHover: "#171717",
  colorPrimaryBorder: darkPalette.colorBorder,
  colorPrimaryHover: shellThemeTokens.colorActionPrimaryBgHover,
  colorPrimaryText: "#60a5fa",
  colorPrimaryTextActive: "#93c5fd",
  colorPrimaryTextHover: "#7dd3fc",
  controlItemBgActive: darkPalette.colorFillSecondary,
  controlItemBgActiveHover: "#171717"
} satisfies ThemeConfig["token"];

const sharedComponentTheme: ThemeConfig["components"] = {
  Button: {
    borderColorDisabled: "#D4D4D8",
    defaultActiveBg: lightPalette.colorBgContainer,
    defaultActiveBorderColor: "#D4D4D8",
    defaultActiveColor: lightPalette.colorText,
    defaultBg: lightPalette.colorBgContainer,
    defaultBorderColor: lightPalette.colorBorder,
    defaultColor: lightPalette.colorText,
    defaultHoverBg: lightPalette.colorFillTertiary,
    defaultHoverBorderColor: "#D4D4D8",
    defaultHoverColor: lightPalette.colorText,
    defaultShadow: "none",
    fontWeight: shellThemeTokens.fontWeightMedium,
    linkHoverBg: "transparent",
    paddingBlock: 2,
    paddingBlockSM: 1,
    paddingInline: 10,
    paddingInlineSM: 8,
    primaryColor: shellThemeTokens.colorActionPrimaryText,
    primaryShadow: "none",
    solidTextColor: shellThemeTokens.colorActionPrimaryText,
    textHoverBg: lightPalette.colorFillSecondary
  },
  Card: {
    actionsBg: lightPalette.colorBgContainer,
    bodyPadding: shellThemeTokens.panelPadding,
    bodyPaddingSM: 12,
    extraColor: lightPalette.colorTextDescription,
    headerBg: "transparent",
    headerHeight: shellThemeTokens.cardHeaderHeight,
    headerHeightSM: 34,
    headerPadding: shellThemeTokens.panelPadding,
    headerPaddingSM: 12
  },
  Dropdown: {
    paddingBlock: 4
  },
  Layout: {
    bodyBg: lightPalette.colorBgLayout,
    headerBg: lightPalette.colorBgLayout,
    headerColor: lightPalette.colorText,
    headerHeight: shellThemeTokens.headerHeight,
    headerPadding: `0 ${shellThemeTokens.headerPaddingInline}px`,
    lightSiderBg: lightPalette.colorBgLayout,
    siderBg: lightPalette.colorBgLayout
  },
  Popover: {
    titleMinWidth: shellThemeTokens.popoverMinWidth
  }
};

export const lightAntdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  components: sharedComponentTheme,
  token: lightToken
};

export const darkAntdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  components: {
    ...sharedComponentTheme,
    Button: {
      ...sharedComponentTheme.Button,
      borderColorDisabled: "#3a4555",
      colorBgSolid: "#FFFFFF",
      colorBgSolidActive: "#EDEDED",
      colorBgSolidHover: "#F5F5F5",
      colorPrimary: "#FFFFFF",
      colorPrimaryActive: "#EDEDED",
      colorPrimaryHover: "#F5F5F5",
      defaultActiveBg: darkPalette.colorBgContainer,
      defaultActiveBorderColor: "#303030",
      defaultActiveColor: darkPalette.colorText,
      defaultBg: darkPalette.colorBgContainer,
      defaultBorderColor: darkPalette.colorBorder,
      defaultColor: darkPalette.colorText,
      defaultHoverBg: darkPalette.colorFillTertiary,
      defaultHoverBorderColor: "#303030",
      defaultHoverColor: darkPalette.colorText,
      primaryColor: "#111111",
      solidTextColor: "#111111",
      textHoverBg: darkPalette.colorFillSecondary
    },
    Card: {
      ...sharedComponentTheme.Card,
      actionsBg: darkPalette.colorBgContainer,
      extraColor: darkPalette.colorTextDescription
    },
    Layout: {
      ...sharedComponentTheme.Layout,
      bodyBg: darkPalette.colorBgLayout,
      headerBg: darkPalette.colorBgLayout,
      headerColor: darkPalette.colorText,
      lightSiderBg: darkPalette.colorBgLayout,
      siderBg: darkPalette.colorBgLayout
    }
  },
  token: darkToken
};

/**
 * 将 UI Shell 的 ThemeMode 转成 Ant Design theme config。
 *
 * 这是 shared/theme 到 Ant Design ConfigProvider 的唯一转换边界；
 * AppShell 和页面组件只消费 Provider 暴露的结果，不直接拼装 Ant Design token。
 *
 * 当前阶段只承接静态 UI 主题，不读取真实偏好、不接后端设置，也不建立 mock / real 主题链路。
 */
export function getAntdThemeConfig(resolvedThemeMode: ResolvedThemeMode): ThemeConfig {
  return resolvedThemeMode === "dark" ? darkAntdTheme : lightAntdTheme;
}
