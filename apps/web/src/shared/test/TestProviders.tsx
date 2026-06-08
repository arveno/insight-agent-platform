import type { ReactNode } from "react";
import { ConfigProvider } from "antd";

import { I18nProvider, useI18n } from "../i18n/I18nProvider";
import { getAntdThemeConfig } from "../theme/antdTheme";

type TestProvidersProps = {
  children: ReactNode;
};

export function TestProviders({ children }: TestProvidersProps) {
  return (
    <I18nProvider>
      <TestConfigProvider>{children}</TestConfigProvider>
    </I18nProvider>
  );
}

function TestConfigProvider({ children }: TestProvidersProps) {
  const { antdLocale } = useI18n();

  return (
    <ConfigProvider locale={antdLocale} theme={getAntdThemeConfig("light")}>
      {children}
    </ConfigProvider>
  );
}
