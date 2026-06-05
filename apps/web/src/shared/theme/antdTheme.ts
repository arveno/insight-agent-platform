import { theme, type ThemeConfig } from "antd";

import { shellThemeTokens } from "./tokens";
import type { ResolvedThemeMode } from "./themeTypes";

const baseToken = {
  borderRadius: shellThemeTokens.borderRadius,
  borderRadiusLG: shellThemeTokens.borderRadiusLG,
  borderRadiusSM: shellThemeTokens.borderRadiusSM,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  boxShadowSecondary: "0 1px 2px rgba(15, 23, 42, 0.04)",
  boxShadowTertiary: "none",
  controlHeight: 36,
  controlHeightSM: 30
} satisfies ThemeConfig["token"];

const lightPalette = {
  colorBgContainer: "#FFFFFF",
  colorBgElevated: "#FFFFFF",
  colorBgLayout: "#FAFAFA",
  colorBorder: "#EAEAEA",
  colorBorderSecondary: "#EDEDED",
  colorFillSecondary: "#F5F5F5",
  colorFillTertiary: "#FAFAFA",
  colorText: "#171717",
  colorTextDescription: "#737373",
  colorTextSecondary: "#525252"
} as const;

const lightToken = {
  ...baseToken,
  ...lightPalette,
  colorLink: shellThemeTokens.colorLink,
  colorLinkActive: shellThemeTokens.colorLinkActive,
  colorLinkHover: shellThemeTokens.colorLinkHover,
  colorPrimary: shellThemeTokens.colorActionPrimaryLight,
  colorPrimaryActive: shellThemeTokens.colorActionPrimaryLightActive,
  colorPrimaryBg: lightPalette.colorFillSecondary,
  colorPrimaryBgHover: "#F0F0F0",
  colorPrimaryBorder: lightPalette.colorBorder,
  colorPrimaryHover: shellThemeTokens.colorActionPrimaryLightHover,
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
  colorBorder: "#262626",
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
  colorLink: "#60a5fa",
  colorLinkActive: "#93c5fd",
  colorLinkHover: "#7dd3fc",
  colorPrimary: shellThemeTokens.colorActionPrimaryDark,
  colorPrimaryActive: shellThemeTokens.colorActionPrimaryDarkActive,
  colorPrimaryBg: darkPalette.colorFillSecondary,
  colorPrimaryBgHover: "#171717",
  colorPrimaryBorder: darkPalette.colorBorder,
  colorPrimaryHover: shellThemeTokens.colorActionPrimaryDarkHover,
  colorPrimaryText: "#60a5fa",
  colorPrimaryTextActive: "#93c5fd",
  colorPrimaryTextHover: "#7dd3fc",
  controlItemBgActive: darkPalette.colorFillSecondary,
  controlItemBgActiveHover: "#171717"
} satisfies ThemeConfig["token"];

const sharedComponentTheme: ThemeConfig["components"] = {
  Button: {
    borderColorDisabled: "#d0d5dd",
    defaultActiveBg: lightPalette.colorBgContainer,
    defaultActiveBorderColor: "#D4D4D4",
    defaultActiveColor: lightPalette.colorText,
    defaultBg: lightPalette.colorBgContainer,
    defaultBorderColor: lightPalette.colorBorder,
    defaultColor: lightPalette.colorText,
    defaultHoverBg: lightPalette.colorBgContainer,
    defaultHoverBorderColor: "#D4D4D4",
    defaultHoverColor: lightPalette.colorText,
    defaultShadow: "none",
    fontWeight: 500,
    linkHoverBg: "transparent",
    paddingBlock: 4,
    paddingBlockSM: 4,
    paddingInline: 14,
    paddingInlineSM: 12,
    primaryColor: shellThemeTokens.colorActionPrimaryTextLight,
    primaryShadow: "none",
    textHoverBg: lightPalette.colorFillSecondary
  },
  Card: {
    actionsBg: lightPalette.colorBgContainer,
    bodyPadding: shellThemeTokens.panelPadding,
    bodyPaddingSM: 16,
    extraColor: lightPalette.colorTextDescription,
    headerBg: "transparent",
    headerHeight: 48,
    headerHeightSM: 40,
    headerPadding: shellThemeTokens.panelPadding,
    headerPaddingSM: 16
  },
  Dropdown: {
    paddingBlock: 4
  },
  Layout: {
    bodyBg: lightPalette.colorBgLayout,
    headerBg: lightPalette.colorBgContainer,
    headerColor: lightPalette.colorText,
    headerHeight: shellThemeTokens.headerHeight,
    headerPadding: `0 ${shellThemeTokens.headerPaddingInline}px`,
    lightSiderBg: lightPalette.colorBgElevated,
    siderBg: lightPalette.colorBgElevated
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
      defaultActiveBg: darkPalette.colorBgContainer,
      defaultActiveBorderColor: "#303030",
      defaultActiveColor: darkPalette.colorText,
      defaultBg: darkPalette.colorBgContainer,
      defaultBorderColor: darkPalette.colorBorder,
      defaultColor: darkPalette.colorText,
      defaultHoverBg: darkPalette.colorBgContainer,
      defaultHoverBorderColor: "#303030",
      defaultHoverColor: darkPalette.colorText,
      primaryColor: shellThemeTokens.colorActionPrimaryTextDark,
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
      headerBg: darkPalette.colorBgContainer,
      headerColor: darkPalette.colorText,
      lightSiderBg: darkPalette.colorBgElevated,
      siderBg: darkPalette.colorBgElevated
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
