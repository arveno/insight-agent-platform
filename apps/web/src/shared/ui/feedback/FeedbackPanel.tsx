import { Button, Card, Radio, Space, Typography } from "antd";

export type FeedbackOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type FeedbackPanelProps = {
  disabled?: boolean;
  helperText?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  options: FeedbackOption[];
  submitLabel?: string;
  targetTitle?: string;
  title: string;
  value?: string;
};

/**
 * 跨页面反馈入口。
 *
 * 组件只承接 Feedback UI State；
 * 不写入 Feedback、Memory 或 Evaluation，也不实现反馈主列表。
 */
export function FeedbackPanel({
  disabled,
  helperText,
  onChange,
  onSubmit,
  options,
  submitLabel,
  targetTitle,
  title,
  value
}: FeedbackPanelProps) {
  return (
    <Card>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={4}>
          <Typography.Text strong>{title}</Typography.Text>
          {targetTitle ? <Typography.Text type="secondary">{targetTitle}</Typography.Text> : null}
        </Space>
        <Radio.Group
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value as string)}
          options={options}
          value={value}
        />
        {helperText ? <Typography.Text type="secondary">{helperText}</Typography.Text> : null}
        {submitLabel ? (
          <Button color="default" disabled={disabled || !value} onClick={onSubmit} variant="solid">
            {submitLabel}
          </Button>
        ) : null}
      </Space>
    </Card>
  );
}
