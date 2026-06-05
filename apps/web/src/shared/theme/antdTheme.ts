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
  colorPrimary: shellThemeTokens.colorPrimary,
  controlHeight: 36,
  controlHeightSM: 30
} satisfies ThemeConfig["token"];

const lightToken = {
  ...baseToken,
  colorBgElevated: "#fcfcfd",
  colorBgLayout: "#f5f6f8",
  colorBorder: "#e5e7eb",
  colorBorderSecondary: "#eceef2",
  colorFillSecondary: "#f3f4f6",
  colorFillTertiary: "#f8fafc",
  colorPrimaryBg: "#eff6ff",
  colorPrimaryBorder: "#dbeafe",
  colorText: "#111827",
  colorTextDescription: "#6b7280",
  colorTextSecondary: "#4b5563",
  controlItemBgActive: "#eef4ff",
  controlItemBgActiveHover: "#e8f0ff"
} satisfies ThemeConfig["token"];

const darkToken = {
  ...baseToken,
  colorBgElevated: "#151821",
  colorBgLayout: "#10131a",
  colorBorder: "#2b3340",
  colorBorderSecondary: "#222a36",
  colorFillSecondary: "#1b2230",
  colorFillTertiary: "#151b26",
  colorPrimaryBg: "#172554",
  colorPrimaryBorder: "#1d4ed8",
  colorText: "#f3f4f6",
  colorTextDescription: "#9ca3af",
  colorTextSecondary: "#c5cad3",
  controlItemBgActive: "#172554",
  controlItemBgActiveHover: "#1e3a8a"
} satisfies ThemeConfig["token"];

const sharedComponentTheme: ThemeConfig["components"] = {
  Button: {
    borderColorDisabled: "#d0d5dd",
    defaultActiveBg: "#ffffff",
    defaultActiveBorderColor: "#d0d5dd",
    defaultActiveColor: "#111827",
    defaultBg: "#ffffff",
    defaultBorderColor: "#e5e7eb",
    defaultColor: "#111827",
    defaultHoverBg: "#ffffff",
    defaultHoverBorderColor: "#d0d5dd",
    defaultHoverColor: "#111827",
    defaultShadow: "none",
    fontWeight: 500,
    linkHoverBg: "transparent",
    paddingBlock: 4,
    paddingBlockSM: 4,
    paddingInline: 14,
    paddingInlineSM: 12,
    primaryShadow: "none",
    textHoverBg: "#f3f4f6"
  },
  Card: {
    actionsBg: "#ffffff",
    bodyPadding: shellThemeTokens.panelPadding,
    bodyPaddingSM: 16,
    extraColor: "#6b7280",
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
    bodyBg: "#f5f6f8",
    headerBg: "#ffffff",
    headerColor: "#111827",
    headerHeight: shellThemeTokens.headerHeight,
    headerPadding: `0 ${shellThemeTokens.headerPaddingInline}px`,
    lightSiderBg: "#fcfcfd",
    siderBg: "#fcfcfd"
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
      defaultActiveBg: "#171b23",
      defaultActiveBorderColor: "#3a4555",
      defaultActiveColor: "#f3f4f6",
      defaultBg: "#171b23",
      defaultBorderColor: "#2b3340",
      defaultColor: "#f3f4f6",
      defaultHoverBg: "#171b23",
      defaultHoverBorderColor: "#3a4555",
      defaultHoverColor: "#f3f4f6",
      textHoverBg: "#1b2230"
    },
    Card: {
      ...sharedComponentTheme.Card,
      actionsBg: "#171b23",
      extraColor: "#9ca3af"
    },
    Layout: {
      ...sharedComponentTheme.Layout,
      bodyBg: "#10131a",
      headerBg: "#171b23",
      headerColor: "#f3f4f6",
      lightSiderBg: "#151821",
      siderBg: "#151821"
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
