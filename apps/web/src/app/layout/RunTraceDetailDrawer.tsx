import { useEffect, type ReactNode } from "react";
import { Button, Descriptions, Divider, Space, Typography } from "antd";

import type { AnalysisRunTraceEventViewModel } from "../../features/agent-analysis/models";
import { AppDrawer, RiskBadge, shellTypographyStyles, StatusTag, useI18n } from "../../shared";
import { toRiskBadge, toStatusTag } from "../../pages/_shared";

export type RunTraceDetailDrawerProps = {
  event?: AnalysisRunTraceEventViewModel;
  onClose: () => void;
  open: boolean;
};

function DetailSection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
      {children}
    </Space>
  );
}

export function RunTraceDetailDrawer({
  event,
  onClose,
  open
}: RunTraceDetailDrawerProps) {
  const { t } = useI18n();
  const drawerRootClassName = "analysis-run-trace-detail-drawer";
  const drawerContainer =
    typeof document === "undefined" ? undefined : () => document.querySelector("main") ?? document.body;
  const resourceItems = [
    event?.toolName
      ? {
          key: "tool-name",
          label: "Tool",
          children: <Typography.Text code>{event.toolName}</Typography.Text>
        }
      : null,
    event?.modelName
      ? {
          key: "model-name",
          label: "Model",
          children: <Typography.Text code>{event.modelName}</Typography.Text>
        }
      : null,
    event?.tokenUsageText
      ? {
          key: "token-usage",
          label: "Tokens",
          children: event.tokenUsageText
        }
      : null,
    event?.costText
      ? {
          key: "cost",
          label: "Cost",
          children: event.costText
        }
      : null
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return undefined;
    }

    const handleDocumentMouseDown = (mouseEvent: MouseEvent) => {
      if (!(mouseEvent.target instanceof Element)) {
        return;
      }

      if (mouseEvent.target.closest(`.${drawerRootClassName}`)) {
        return;
      }

      if (mouseEvent.target.closest("[data-trace-timeline-trigger='true']")) {
        return;
      }

      onClose();
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [drawerRootClassName, onClose, open]);

  return (
    <AppDrawer
      destroyOnHidden={false}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>关闭详情</Button>
        </div>
      }
      mask={false}
      getContainer={drawerContainer}
      onClose={onClose}
      open={open}
      placement="right"
      rootClassName={drawerRootClassName}
      rootStyle={{
        position: "absolute"
      }}
      title="Trace Event Detail"
      width={480}
    >
      {event ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Typography.Text style={shellTypographyStyles.cardTitle}>{event.title}</Typography.Text>
            <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
              {event.summary}
            </Typography.Text>
          </Space>

          <Descriptions
            column={1}
            items={[
              {
                key: "event-type",
                label: "Event type",
                children: <Typography.Text code>{event.eventType}</Typography.Text>
              },
              {
                key: "status",
                label: "Status",
                children: <StatusTag {...toStatusTag(t, event.status)!} />
              },
              {
                key: "risk",
                label: "Risk",
                children: event.risk ? <RiskBadge {...toRiskBadge(t, event.risk)!} /> : "None"
              },
              {
                key: "timestamp",
                label: "Timestamp",
                children: event.timestampText ?? "N/A"
              },
              {
                key: "duration",
                label: "Duration",
                children: event.durationText ?? "N/A"
              }
            ]}
            size="small"
          />

          <Divider style={{ marginBlock: 0 }} />

          <DetailSection title="Detail">
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {event.detail}
            </Typography.Paragraph>
          </DetailSection>

          {event.inputSummary ? (
            <DetailSection title="Input Summary">
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {event.inputSummary}
              </Typography.Paragraph>
            </DetailSection>
          ) : null}

          {event.outputSummary ? (
            <DetailSection title="Output Summary">
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {event.outputSummary}
              </Typography.Paragraph>
            </DetailSection>
          ) : null}

          {event.toolName || event.modelName || event.tokenUsageText || event.costText ? (
            <Descriptions column={1} items={resourceItems} size="small" />
          ) : null}

          {event.errorType ? (
            <Descriptions
              column={1}
              items={[
                {
                  key: "error-type",
                  label: "Error type",
                  children: event.errorType
                }
              ]}
              size="small"
            />
          ) : null}

          {event.evidenceRefs?.length ? (
            <DetailSection title="Evidence References">
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                {event.evidenceRefs.map((reference) => (
                  <Typography.Text code key={reference}>
                    {reference}
                  </Typography.Text>
                ))}
              </Space>
            </DetailSection>
          ) : null}
        </Space>
      ) : null}
    </AppDrawer>
  );
}
