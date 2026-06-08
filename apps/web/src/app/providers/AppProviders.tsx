import type { ReactNode } from "react";
import { ConfigProvider } from "antd";

import { useAppTheme, AppThemeProvider } from "../theme/AppThemeProvider";
import { I18nProvider, useI18n } from "../../shared/i18n/I18nProvider";

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * UI Shell 的全局 Provider 链路入口。
 *
 * 这一层负责把 Theme、I18n 和 Ant Design ConfigProvider 串到 React 根节点下，
 * 是 #17 Production UI Shell 静态阶段的第一层运行时边界。
 *
 * 当前阶段只提供静态 UI 所需的主题和语言承接；
 * 不读取真实用户偏好、不调用 API、不持久化设置，也不形成 mock / real 双链路。
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppThemeProvider>
      <I18nProvider>
        <AntdConfigProvider>{children}</AntdConfigProvider>
      </I18nProvider>
    </AppThemeProvider>
  );
}

/**
 * Ant Design ConfigProvider 的最小装配层。
 *
 * 这里只消费上游 Provider 已准备好的 antd theme 与 locale，
 * 不在组件内解析业务数据、不接 ViewModel mapper 之外的数据，也不承接 #66 的 layout 组件本体。
 */
function AntdConfigProvider({ children }: AppProvidersProps) {
  const { antdTheme } = useAppTheme();
  const { antdLocale } = useI18n();

  return (
    <ConfigProvider locale={antdLocale} theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
}
