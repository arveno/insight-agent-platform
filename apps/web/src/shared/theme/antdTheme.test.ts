import { describe, expect, it } from "vitest";

import { darkAntdTheme, lightAntdTheme } from "./antdTheme";
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

describe("darkAntdTheme", () => {
  it("keeps solid and primary buttons inverted against the dark shell", () => {
    expect(darkAntdTheme.components?.Button?.colorBgSolid).toBe("#FFFFFF");
    expect(darkAntdTheme.components?.Button?.colorBgSolidHover).toBe("#F5F5F5");
    expect(darkAntdTheme.components?.Button?.colorBgSolidActive).toBe("#EDEDED");
    expect(darkAntdTheme.components?.Button?.colorPrimary).toBe("#FFFFFF");
    expect(darkAntdTheme.components?.Button?.colorPrimaryHover).toBe("#F5F5F5");
    expect(darkAntdTheme.components?.Button?.colorPrimaryActive).toBe("#EDEDED");
    expect(darkAntdTheme.components?.Button?.primaryColor).toBe("#111111");
    expect(darkAntdTheme.components?.Button?.solidTextColor).toBe("#111111");
  });
});

describe("shellThemeTokens", () => {
  it("keeps page-level section rhythm separate from section internal spacing", () => {
    expect(shellThemeTokens.pageSectionGap).toBe(20);
    expect(shellThemeTokens.sectionContentGap).toBe(12);
  });
});
