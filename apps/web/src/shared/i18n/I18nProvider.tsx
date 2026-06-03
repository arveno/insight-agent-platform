import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";

import { defaultLocale, type AppLocale } from "./localeTypes";
import { messages, type I18nMessageKey } from "./messages";

const antdLocales = {
  "en-US": enUS,
  "zh-CN": zhCN
} as const;

type I18nContextValue = {
  antdLocale: (typeof antdLocales)[AppLocale];
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: I18nMessageKey) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

type I18nProviderProps = {
  children: ReactNode;
};

/**
 * UI Shell 的语言状态 Provider。
 *
 * 这一层只提供静态 UI 阶段需要的 locale、Ant Design locale 与轻量翻译函数；
 * 文案来源固定在 shared/i18n/messages，避免页面组件自行散落语言判断。
 *
 * 当前阶段不实现真实语言切换持久化、不读取用户设置、不调用 API，
 * 也不引入额外 i18n 框架或 mock / real 双链路。
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<AppLocale>(defaultLocale);

  const value = useMemo<I18nContextValue>(
    () => ({
      antdLocale: antdLocales[locale],
      locale,
      setLocale,
      t: (key) => messages[locale][key]
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * 读取 UI Shell 语言上下文的统一入口。
 *
 * 组件通过该入口消费 locale 与静态文案；
 * 不在 UI 组件内直接判断真实用户偏好或解析后端返回。
 */
export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
