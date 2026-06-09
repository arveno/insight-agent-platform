import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";

import { AnalysisComposer } from "./AnalysisComposer";

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined
    })
  });
});

describe("AnalysisComposer", () => {
  it("delegates draft, mode, model, and submit interactions through controller actions", async () => {
    const session = analysisStaticViewModel.sessions[0];
    const onComposerDraftChange = vi.fn();
    const onComposerModeChange = vi.fn();
    const onSelectModel = vi.fn();
    const onSubmitComposer = vi.fn();

    render(
      <TestProviders>
        <AnalysisComposer
          composerDraft={session.followUpComposer.initialDraft}
          composerMode="follow_up"
          composerState="idle"
          interactionMessage=""
          modelOptions={analysisStaticViewModel.modelOptions}
          onComposerAccessoryClick={vi.fn()}
          onComposerDraftChange={onComposerDraftChange}
          onComposerModeChange={onComposerModeChange}
          onComposerStop={vi.fn()}
          onSelectModel={onSelectModel}
          onSubmitComposer={onSubmitComposer}
          selectedModelKey={analysisStaticViewModel.modelOptions[0].key}
          selectedModelLabel={analysisStaticViewModel.modelOptions[0].label}
          selectedSessionComposers={{
            analysis: session.inputComposer,
            followUp: session.followUpComposer
          }}
        />
      </TestProviders>
    );

    fireEvent.click(screen.getByText("分析任务"));
    expect(onComposerModeChange).toHaveBeenCalledWith("analysis");

    fireEvent.change(screen.getByRole("textbox", { name: "后续追问" }), {
      target: { value: "继续收紧华东时间窗口。" }
    });
    expect(onComposerDraftChange).toHaveBeenCalledWith("继续收紧华东时间窗口。");

    fireEvent.click(screen.getByRole("button", { name: "选择模型" }));
    fireEvent.click(await screen.findByText("Reasoning"));
    expect(onSelectModel).toHaveBeenCalledWith("reasoning");

    fireEvent.click(screen.getByRole("button", { name: "发送消息" }));
    expect(onSubmitComposer).toHaveBeenCalledTimes(1);
  });
});
