import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import { defaultThemeMode, getAntdThemeConfig, type ThemeMode } from "../../shared/theme";

type AppThemeContextValue = {
  antdTheme: ReturnType<typeof getAntdThemeConfig>;
  setThemeMode: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

type AppThemeProviderProps = {
  children: ReactNode;
};

/**
 * UI Shell 的主题状态 Provider。
 *
 * 这一层只维护静态 UI 阶段需要的 ThemeMode，并把它转换为 Ant Design theme config；
 * 主题展示文案交给 I18n 层处理，避免 ThemeProvider 直接承担语言职责。
 *
 * 当前阶段不读取 localStorage、不保存真实用户偏好、不调用后端设置接口，
 * 也不为偏好配置建立 mock / real 双链路。
 */
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultThemeMode);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      antdTheme: getAntdThemeConfig(themeMode),
      setThemeMode,
      themeMode
    }),
    [themeMode]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

/**
 * 读取 UI Shell 主题上下文的统一入口。
 *
 * 组件只能通过该入口消费主题状态和 Ant Design theme config，
 * 不应绕过 shared/theme token 直接拼装第二套主题体系。
 */
export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider.");
  }

  return context;
}
