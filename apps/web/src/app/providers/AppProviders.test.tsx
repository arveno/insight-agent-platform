import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppIcon } from "../../shared/icons/AppIcon";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { useAppTheme } from "./AppThemeProvider";
import { AppProviders } from "./AppProviders";

afterEach(cleanup);

function ProviderProbe() {
  const { locale, t } = useI18n();
  const { resolvedThemeMode, themeMode } = useAppTheme();
  const themeModeKeyByValue = {
    dark: "themeMode.dark",
    light: "themeMode.light",
    system: "themeMode.system"
  } as const;
  const themeModeLabel = t(themeModeKeyByValue[themeMode]);

  return (
    <div>
      <span>{t("appName")}</span>
      <span>{locale}</span>
      <span>{themeMode}</span>
      <span>{resolvedThemeMode}</span>
      <span>{themeModeLabel}</span>
      <AppIcon name="settings" title={t("settings")} variant="glyph" />
      <AppIcon name="settings" title={`${t("settings")}-badge`} variant="badge" />
    </div>
  );
}

describe("AppProviders", () => {
  it("provides the default i18n, theme, and icon foundations", () => {
    render(
      <AppProviders>
        <ProviderProbe />
      </AppProviders>
    );

    expect(screen.getByText("Insight Agent")).toBeTruthy();
    expect(screen.getByText("zh-CN")).toBeTruthy();
    expect(screen.getByText("system")).toBeTruthy();
    expect(screen.getByText("light")).toBeTruthy();
    expect(screen.getByText("系统")).toBeTruthy();
    expect(screen.getByLabelText("设置").querySelector("svg")).toBeTruthy();
    expect(screen.getByLabelText("设置-badge").textContent).toBe("S");
  });
});
