import type { CSSProperties } from "react";
import {
  ApiOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BulbOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HistoryOutlined,
  LinkOutlined,
  MessageOutlined,
  MonitorOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ToolOutlined,
  TranslationOutlined,
  UserOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { theme } from "antd";

import type { AppIconVariant, IconName } from "./iconTypes";

type GlyphIconComponent = typeof DashboardOutlined;

const badgeLabels: Record<IconName, string> = {
  analysis: "A",
  dashboard: "D",
  data: "DK",
  evidence: "EV",
  evaluation: "E",
  feedback: "F",
  governance: "G",
  language: "L",
  memory: "M",
  metrics: "MT",
  models: "MO",
  observability: "O",
  operations: "OP",
  reports: "R",
  risk: "!",
  settings: "S",
  source: "SRC",
  theme: "T",
  trace: "TR",
  user: "U",
  workspace: "W"
};

const glyphIcons: Record<IconName, GlyphIconComponent> = {
  analysis: BulbOutlined,
  dashboard: DashboardOutlined,
  data: DatabaseOutlined,
  evidence: FileSearchOutlined,
  evaluation: ExperimentOutlined,
  feedback: MessageOutlined,
  governance: SafetyCertificateOutlined,
  language: TranslationOutlined,
  memory: HistoryOutlined,
  metrics: BarChartOutlined,
  models: ApiOutlined,
  observability: MonitorOutlined,
  operations: ToolOutlined,
  reports: FileTextOutlined,
  risk: WarningOutlined,
  settings: SettingOutlined,
  source: LinkOutlined,
  theme: GlobalOutlined,
  trace: AuditOutlined,
  user: UserOutlined,
  workspace: BankOutlined
};

type AppIconProps = {
  name: IconName;
  title?: string;
  variant?: AppIconVariant;
};

const baseIconStyle: CSSProperties = {
  alignItems: "center",
  display: "inline-flex",
  justifyContent: "center",
  lineHeight: 1,
  marginInlineEnd: 8,
  verticalAlign: "-0.125em"
};

/**
 * UI Shell 的统一 Icon 出口组件。
 *
 * glyph 仅用于 LeftNav 导航项扫描；badge 用于品牌区、按钮和能力动作。
 * 图标依赖只能在这一层引入，页面和业务组件必须继续通过 IconName -> AppIcon 边界消费。
 *
 * 这里不引入第二套 UI 组件库，也不把页面私有业务组件提升到 shared。
 */
export function AppIcon({ name, title, variant = "badge" }: AppIconProps) {
  const { token } = theme.useToken();
  const accessibilityProps = title
    ? { "aria-label": title, role: "img" as const }
    : { "aria-hidden": true as const };

  if (variant === "badge") {
    return (
      <span
        {...accessibilityProps}
        style={{
          ...baseIconStyle,
          border: "1px solid currentColor",
          borderRadius: token.borderRadiusSM,
          fontSize: token.fontSizeSM,
          fontWeight: token.fontWeightStrong,
          height: token.controlHeightXS,
          minWidth: token.controlHeightXS,
          paddingInline: token.paddingXXS
        }}
      >
        {badgeLabels[name]}
      </span>
    );
  }

  const GlyphIcon = glyphIcons[name];

  return (
    <span
      {...accessibilityProps}
      style={{
        ...baseIconStyle,
        color: "currentColor",
        fontSize: token.fontSizeLG
      }}
    >
      <GlyphIcon />
    </span>
  );
}
