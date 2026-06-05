import { describe, expect, it } from "vitest";

import { lightAntdTheme } from "./antdTheme";
import { shellThemeTokens } from "./tokens";

describe("lightAntdTheme", () => {
  it("sets compact typography and density tokens for the console shell", () => {
    expect(lightAntdTheme.token?.fontSize).toBe(shellThemeTokens.fontSizeBody);
    expect(lightAntdTheme.token?.fontSizeSM).toBe(shellThemeTokens.fontSizeMeta);
    expect(lightAntdTheme.token?.fontSizeLG).toBe(shellThemeTokens.fontSizeSectionTitle);
    expect(lightAntdTheme.token?.fontSizeHeading1).toBe(shellThemeTokens.fontSizePageTitle);
    expect(lightAntdTheme.token?.fontSizeHeading2).toBe(shellThemeTokens.fontSizeHeroTitle);
    expect(lightAntdTheme.token?.fontWeightStrong).toBe(shellThemeTokens.fontWeightSemibold);

    expect(lightAntdTheme.components?.Button?.fontWeight).toBe(shellThemeTokens.fontWeightMedium);
    expect(lightAntdTheme.components?.Card?.bodyPadding).toBe(shellThemeTokens.panelPadding);
    expect(lightAntdTheme.components?.Card?.headerHeight).toBe(shellThemeTokens.cardHeaderHeight);
    expect(lightAntdTheme.components?.Card?.headerPadding).toBe(shellThemeTokens.panelPadding);
  });
});
