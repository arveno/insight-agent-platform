import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../../app/providers/AppProviders";
import { shellThemeTokens } from "../../theme";
import { AppActionButton } from "./AppActionButton";

afterEach(cleanup);

describe("AppActionButton", () => {
  it("maps primary action variants to the neutral solid button style", () => {
    render(
      <AppProviders>
        <AppActionButton variant="globalPrimary">发起分析</AppActionButton>
      </AppProviders>
    );

    const button = screen.getByRole("button", { name: "发起分析" });

    expect(button.className).toContain("ant-btn-color-default");
    expect(button.className).toContain("ant-btn-variant-solid");
    expect(button.className).not.toContain("ant-btn-primary");
  });

  it("keeps module entry actions on the default outlined button track", () => {
    render(
      <AppProviders>
        <AppActionButton variant="moduleEntry">查看指标</AppActionButton>
      </AppProviders>
    );

    const button = screen.getByRole("button", { name: "查看指标" });

    expect(button.className).toContain("ant-btn-color-default");
    expect(button.className).toContain("ant-btn-variant-outlined");
  });

  it("uses compact button typography for console density", () => {
    render(
      <AppProviders>
        <AppActionButton variant="moduleEntry">查看指标</AppActionButton>
      </AppProviders>
    );

    const button = screen.getByRole("button", { name: "查看指标" });
    const style = button.getAttribute("style") ?? "";

    expect(style).toContain(`font-size: ${shellThemeTokens.fontSizeButton}px`);
    expect(style).toContain(`font-weight: ${shellThemeTokens.fontWeightMedium}`);
  });
});
