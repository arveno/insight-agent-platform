import { theme, type ThemeConfig } from "antd";

import { shellThemeTokens } from "./tokens";
import type { ResolvedThemeMode } from "./themeTypes";

const baseToken: ThemeConfig["token"] = {
  borderRadius: shellThemeTokens.borderRadius,
  colorPrimary: shellThemeTokens.colorPrimary
};

export const lightAntdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: baseToken
};

export const darkAntdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: baseToken
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
