import { Button, Card, Radio, Space, Typography } from "antd";

import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";

export type FeedbackOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type ReportFeedbackPanelProps = {
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
 * 报告阅读页中的反馈入口。
 *
 * 组件只承接当前报告上下文的 Feedback UI State；
 * 不写入 Feedback、Memory 或 Evaluation，也不承接反馈主列表。
 */
export function ReportFeedbackPanel({
  disabled,
  helperText,
  onChange,
  onSubmit,
  options,
  submitLabel,
  targetTitle,
  title,
  value
}: ReportFeedbackPanelProps) {
  return (
    <Card>
      <Space direction="vertical" size={shellThemeTokens.cardContentGap} style={{ width: "100%" }}>
        <Space direction="vertical" size={4}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
          {targetTitle ? (
            <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
              {targetTitle}
            </Typography.Text>
          ) : null}
        </Space>
        <Radio.Group
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value as string)}
          options={options}
          value={value}
        />
        {helperText ? (
          <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
            {helperText}
          </Typography.Text>
        ) : null}
        {submitLabel ? (
          <Button color="default" disabled={disabled || !value} onClick={onSubmit} variant="solid">
            {submitLabel}
          </Button>
        ) : null}
      </Space>
    </Card>
  );
}
