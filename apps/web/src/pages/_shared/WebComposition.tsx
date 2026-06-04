import type { ReactNode } from "react";
import { Badge, Card, Col, Row, Space, Typography } from "antd";

import type {
  StaticMetricCardViewModel,
  StaticPageStateCoverageViewModel,
  StaticPageViewModelBase,
  StaticRightAssistSummaryViewModel,
  StaticSectionViewModel,
  StaticSummaryItemViewModel,
  StaticTabViewModel
} from "../../app/models";
import {
  AppTabs,
  CardList,
  ChartCard,
  DataTable,
  MetricCard,
  PageHeader,
  ResponsivePageShell,
  RightAssistPanel,
  SourceEvidenceList,
  StatusTag,
  TraceTimeline,
  WarningRiskBanner,
  useI18n
} from "../../shared";
import { translateKey } from "./text";
import type { NavigateToRoute } from "./types";
import {
  ActionBar,
  metricMeta,
  pageStateMessage,
  pageStateTitle,
  summaryDescription,
  summaryMeta,
  toEvidenceItem,
  toReportItem,
  toRiskBadge,
  toStatusTag,
  toTraceItem
} from "./viewModelAdapters";

export type WebPageScaffoldProps = {
  children: ReactNode;
  onNavigate?: NavigateToRoute;
  viewModel: StaticPageViewModelBase;
};

export function WebPageScaffold({ children, onNavigate, viewModel }: WebPageScaffoldProps) {
  const { t } = useI18n();
  const actions = [viewModel.primaryAction, ...viewModel.secondaryActions];

  return (
    <ResponsivePageShell
      header={
        <PageHeader
          actions={<ActionBar actions={actions} onNavigate={onNavigate} t={t} />}
          meta={
            <Space wrap>
              <StatusTag
                {...toStatusTag(t, {
                  labelKey: viewModel.stateCoverage.ready.titleKey,
                  status: viewModel.stateCoverage.ready.kind
                })!}
              />
              <Typography.Text type="secondary">
                {translateKey(t, "chrome.lastUpdated")}: {viewModel.lastUpdatedAt}
              </Typography.Text>
            </Space>
          }
          subtitle={translateKey(t, viewModel.pageDescriptionKey)}
          title={translateKey(t, viewModel.pageTitleKey)}
        />
      }
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {viewModel.gapNote ? (
          <WarningRiskBanner
            description={viewModel.gapNote}
            message={translateKey(t, "surface.gap.title")}
            riskLevel="medium"
          />
        ) : null}
        {children}
        <StateCoveragePanel coverage={viewModel.stateCoverage} />
      </Space>
    </ResponsivePageShell>
  );
}

export type WebSectionProps = {
  children: ReactNode;
  section: StaticSectionViewModel;
};

export function WebSection({ children, section }: WebSectionProps) {
  const { t } = useI18n();

  return (
    <Card
      title={
        <Space wrap>
          <Typography.Text strong>{translateKey(t, section.titleKey)}</Typography.Text>
          <StatusTag {...toStatusTag(t, section.status)!} />
        </Space>
      }
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Text type="secondary">
          {translateKey(t, section.descriptionKey)}
        </Typography.Text>
        {children}
      </Space>
    </Card>
  );
}

export type SummaryCardGridProps = {
  items: StaticSummaryItemViewModel[];
};

export function SummaryCardGrid({ items }: SummaryCardGridProps) {
  const { t } = useI18n();

  return (
    <CardList
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => ({
        description: summaryDescription(item),
        key: item.key,
        meta: summaryMeta(item),
        risk: toRiskBadge(t, item.risk),
        status: toStatusTag(t, item.status),
        title: item.label,
        extra: <Typography.Text strong>{item.value}</Typography.Text>
      }))}
    />
  );
}

export type SummaryTableProps = {
  items: StaticSummaryItemViewModel[];
};

export function SummaryTable({ items }: SummaryTableProps) {
  const { t } = useI18n();

  return (
    <DataTable<StaticSummaryItemViewModel>
      columns={[
        {
          dataIndex: "label",
          title: translateKey(t, "table.column.item")
        },
        {
          dataIndex: "value",
          title: translateKey(t, "table.column.value")
        },
        {
          key: "status",
          render: (_, row) => (row.status ? <StatusTag {...toStatusTag(t, row.status)!} /> : null),
          title: translateKey(t, "table.column.status")
        },
        {
          key: "risk",
          render: (_, row) => {
            const risk = toRiskBadge(t, row.risk);
            return risk ? <span>{risk.label}</span> : null;
          },
          title: translateKey(t, "table.column.risk")
        },
        {
          dataIndex: "description",
          title: translateKey(t, "table.column.description")
        }
      ]}
      rowKey="key"
      rows={items}
      state={
        items.length > 0
          ? { kind: "ready" }
          : { kind: "empty", empty: { title: translateKey(t, "state.empty.default.title") } }
      }
    />
  );
}

export type MetricCardGridProps = {
  items: StaticMetricCardViewModel[];
};

export function MetricCardGrid({ items }: MetricCardGridProps) {
  const { t } = useI18n();

  return (
    <Row gutter={[16, 16]}>
      {items.map((metric) => (
        <Col key={metric.key} lg={8} md={12} xs={24}>
          <MetricCard
            evidenceSummary={metricMeta(metric)}
            risk={toRiskBadge(t, metric.risk)}
            status={toStatusTag(t, metric.status)}
            title={metric.label}
            value={metric.valueText}
          />
        </Col>
      ))}
    </Row>
  );
}

export type StaticChartProps = {
  metrics?: StaticMetricCardViewModel[];
  summary?: StaticSummaryItemViewModel[];
  titleKey: string;
};

export function StaticChart({ metrics = [], summary = [], titleKey }: StaticChartProps) {
  const { t } = useI18n();
  const points = [
    ...metrics.map((metric, index) => ({
      key: metric.key,
      label: metric.label,
      value: 80 - index * 12
    })),
    ...summary.map((item, index) => ({ key: item.key, label: item.label, value: 62 - index * 10 }))
  ].slice(0, 5);

  return (
    <ChartCard
      subtitle={translateKey(t, "chart.static.subtitle")}
      title={translateKey(t, titleKey)}
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {points.map((point) => (
          <div key={point.key}>
            <Space style={{ justifyContent: "space-between", width: "100%" }}>
              <Typography.Text>{point.label}</Typography.Text>
              <Typography.Text type="secondary">{point.value}</Typography.Text>
            </Space>
            <div style={{ background: "#f0f5ff", borderRadius: 4, height: 8, overflow: "hidden" }}>
              <div
                style={{ background: "#1677ff", height: 8, width: `${Math.max(point.value, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </Space>
    </ChartCard>
  );
}

export type EvidencePanelProps = {
  items: StaticRightAssistSummaryViewModel["evidence"];
};

export function EvidencePanel({ items }: EvidencePanelProps) {
  const { t } = useI18n();

  return (
    <SourceEvidenceList
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => toEvidenceItem(item))}
    />
  );
}

export type TracePanelProps = {
  items: NonNullable<StaticRightAssistSummaryViewModel["traces"]>;
};

export function TracePanel({ items }: TracePanelProps) {
  const { t } = useI18n();

  return (
    <TraceTimeline
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => toTraceItem(t, item))}
    />
  );
}

export type ReportEntranceListProps = {
  items: ReturnType<typeof toReportItem>[];
};

export function ReportEntranceList({ items }: ReportEntranceListProps) {
  return <SummaryCardGrid items={items} />;
}

export type TabsPanelProps = {
  childrenByKey: Record<string, ReactNode>;
  tabs: StaticTabViewModel[];
};

export function TabsPanel({ childrenByKey, tabs }: TabsPanelProps) {
  const { t } = useI18n();

  return (
    <AppTabs
      items={tabs.map((tab) => ({
        children: childrenByKey[tab.key],
        key: tab.key,
        label: (
          <Space>
            {translateKey(t, tab.labelKey)}
            {typeof tab.count === "number" ? <Badge count={tab.count} size="small" /> : null}
          </Space>
        )
      }))}
    />
  );
}

export type StateCoveragePanelProps = {
  coverage: StaticPageStateCoverageViewModel;
};

export function StateCoveragePanel({ coverage }: StateCoveragePanelProps) {
  const { t } = useI18n();
  const states = Object.values(coverage);

  return (
    <Card size="small" title={translateKey(t, "chrome.stateCoverage")}>
      <Row gutter={[12, 12]}>
        {states.map((state) => (
          <Col key={state.kind} lg={6} md={8} xs={24}>
            <Space direction="vertical" size={4}>
              <StatusTag
                label={pageStateTitle(t, state)}
                tone={toStatusTag(t, { labelKey: state.titleKey, status: state.kind })?.tone}
              />
              <Typography.Text type="secondary">{pageStateMessage(t, state)}</Typography.Text>
            </Space>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export type RightAssistSummaryPanelProps = {
  onNavigate?: NavigateToRoute;
  summary: StaticRightAssistSummaryViewModel;
};

export function RightAssistSummaryPanel({ onNavigate, summary }: RightAssistSummaryPanelProps) {
  const { t } = useI18n();

  return (
    <RightAssistPanel
      description={translateKey(t, summary.descriptionKey)}
      title={translateKey(t, summary.titleKey)}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <StatusTag {...toStatusTag(t, summary.status)!} />
        <ActionBar actions={summary.links} onNavigate={onNavigate} t={t} />
        <EvidencePanel items={summary.evidence} />
        {summary.traces ? <TracePanel items={summary.traces} /> : null}
      </Space>
    </RightAssistPanel>
  );
}

export { toReportItem };
