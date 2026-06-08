import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { shellThemeTokens } from "../../theme/tokens";
import { SectionStack } from "./SectionStack";

afterEach(cleanup);

describe("SectionStack", () => {
  it("keeps section spacing without taking ownership of page padding", () => {
    const { container } = render(
      <SectionStack>
        <div>first block</div>
        <div>second block</div>
      </SectionStack>
    );

    const stack = container.querySelector(".ant-space-vertical");

    expect(stack).toBeTruthy();
    expect(stack?.getAttribute("style")).toContain("width: 100%");
    expect(stack?.getAttribute("style")).not.toContain(`padding: ${shellThemeTokens.pagePadding}px`);
  });
});
