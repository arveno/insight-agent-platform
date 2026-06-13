import { useEffect, useRef } from "react";
import { ArrowUpOutlined, DownOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space, Typography, theme } from "antd";

import { CardSurface } from "../../../shared/ui/surfaces/CardSurface";
import type { AnalysisComposerMode, AnalysisComposerViewModel } from "../models/analysisViewModel";

export type AnalysisComposerProps = {
  composerDraft: string;
  composerMode: AnalysisComposerMode;
  composerState: "idle" | "running";
  interactionMessage: string;
  modelOptions: readonly { key: string; label: string }[];
  onComposerAccessoryClick: () => void;
  onComposerDraftChange: (value: string) => void;
  onComposerModeChange: (mode: AnalysisComposerMode) => void;
  onComposerStop: () => void;
  onSelectModel: (key: string) => void;
  onSubmitComposer: () => void;
  selectedModelKey: string;
  selectedModelLabel: string;
  selectedSessionComposers: {
    analysis: AnalysisComposerViewModel;
    followUp: AnalysisComposerViewModel;
  };
};

export function AnalysisComposer({
  composerDraft,
  composerMode,
  composerState,
  interactionMessage,
  modelOptions,
  onComposerAccessoryClick,
  onComposerDraftChange,
  onComposerModeChange: _onComposerModeChange,
  onComposerStop,
  onSelectModel,
  onSubmitComposer,
  selectedModelKey,
  selectedModelLabel,
  selectedSessionComposers
}: AnalysisComposerProps) {
  const { token } = theme.useToken();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeComposer =
    composerMode === "analysis"
      ? selectedSessionComposers.analysis
      : selectedSessionComposers.followUp;
  const modelMenuItems = modelOptions.map((option) => ({
    key: option.key,
    label: option.label
  }));

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const maxHeight = 144;
    const minHeight = 72;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight))}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [composerDraft]);

  return (
    <footer
      aria-label="Analysis composer"
      role="group"
      style={{
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        flex: "0 0 auto",
        padding: token.paddingLG
      }}
    >
      <CardSurface
        style={{
          height: "auto"
        }}
        styles={{
          body: {
            height: "auto",
            padding: token.paddingSM
          }
        }}
      >
        <textarea
          aria-label={activeComposer.title}
          ref={textareaRef}
          onChange={(event) => onComposerDraftChange(event.target.value)}
          placeholder={activeComposer.placeholder}
          rows={3}
          style={{
            background: "transparent",
            border: "none",
            color: token.colorText,
            display: "block",
            fontFamily: "inherit",
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
            marginBottom: token.marginSM,
            maxHeight: 144,
            minHeight: 72,
            outline: "none",
            overflowY: "hidden",
            padding: 0,
            resize: "none",
            width: "100%"
          }}
          value={composerDraft}
        />
        {interactionMessage ? (
          <div style={{ marginBottom: token.marginSM }}>
            <Typography.Text type="secondary">{interactionMessage}</Typography.Text>
          </div>
        ) : null}
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: token.marginSM,
            justifyContent: "space-between",
            width: "100%"
          }}
        >
          <Button
            aria-label="打开聊天工具入口"
            color="default"
            icon={<PlusOutlined />}
            onClick={onComposerAccessoryClick}
            shape="circle"
            type="default"
          />
          <Space size={token.marginSM}>
            <Dropdown
              menu={{
                items: modelMenuItems,
                onClick: ({ key }) => onSelectModel(String(key)),
                selectable: true,
                selectedKeys: [selectedModelKey]
              }}
              trigger={["click"]}
            >
              <Button aria-label="选择模型" type="default">
                {selectedModelLabel}
                <DownOutlined />
              </Button>
            </Dropdown>
            <Button
              aria-label={composerState === "running" ? "停止" : "发送"}
              color="default"
              disabled={composerState === "idle" && composerDraft.trim().length === 0}
              icon={composerState === "running" ? <StopOutlined /> : <ArrowUpOutlined />}
              onClick={composerState === "running" ? onComposerStop : onSubmitComposer}
              shape="circle"
              variant="solid"
            />
          </Space>
        </div>
      </CardSurface>
      <span
        aria-live="polite"
        style={{
          border: 0,
          clip: "rect(0 0 0 0)",
          height: 1,
          margin: -1,
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          whiteSpace: "nowrap",
          width: 1
        }}
      >
        {interactionMessage}
      </span>
    </footer>
  );
}
