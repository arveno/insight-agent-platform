export type AppLocale = "zh-CN" | "en-US";

export type LocaleOption = {
  label: string;
  value: AppLocale;
};

export const defaultLocale: AppLocale = "zh-CN";

export const localeOptions: LocaleOption[] = [
  { label: "简体中文", value: "zh-CN" },
  { label: "English", value: "en-US" }
];
