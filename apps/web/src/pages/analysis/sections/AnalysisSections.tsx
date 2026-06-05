import { Alert, Button, Input, List, Space, Typography, theme } from "antd";

import type { AnalysisViewModel } from "../../../features/static-view-models";
import {
  AppActionGroup,
  AppBaseCard,
  AppCardGrid,
  AppSection,
  AppSectionStack,
  FeedbackPanel,
  ReportSection,
  RiskBadge,
  SourceEvidenceList,
  StatusTag,
  TraceTimeline,
  useI18n
} from "../../../shared";
import { createRouteAction, toRiskBadge, toStatusTag, translateKey, type WebPageProps } from "../../_shared";

const { TextArea } = Input;

export type AnalysisSectionsProps = WebPageProps & {
  analysisDraft: string;
  feedbackValue?: string;
  followUpDraft: string;
  interactionMessage: string;
  onAnalysisDraftChange: (value: string) => void;
  onAnalysisSubmit: () => void;
  onFeedbackChange: (value: string) => void;
  onFeedbackSubmit: () => void;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onSelectAnalysisSuggestion: (value: string) => void;
  onSelectFollowUpSuggestion: (value: string) => void;
  onSelectSession: (key: string) => void;
  selectedSession: AnalysisViewModel["sessions"][number];
  selectedSessionKey: string;
  viewModel: AnalysisViewModel;
};

export function AnalysisSections({
  analysisDraft,
  feedbackValue,
  followUpDraft,
  interactionMessage,
  onAnalysisDraftChange,
  onAnalysisSubmit,
  onFeedbackChange,
  onFeedbackSubmit,
  onFollowUpDraftChange,
  onFollowUpSubmit,
  onSelectAnalysisSuggestion,
  onSelectFollowUpSuggestion,
  onSelectSession,
  onNavigate,
  selectedSession,
  selectedSessionKey,
  viewModel
}: AnalysisSectionsProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const traceAction = createRouteAction({
    iconName: "observability",
    key: `${selectedSession.traceSummary.key}-route`,
    label: selectedSession.traceSummary.actionLabel,
    onNavigate,
    route: selectedSession.traceSummary.targetRoute,
    variant: "moduleEntry"
  });
  const reportAction = createRouteAction({
    iconName: "reports",
    key: `${selectedSession.reportEntry.key}-route`,
    label: selectedSession.reportEntry.actionLabel,
    onNavigate,
    route: selectedSession.reportEntry.targetRoute,
    variant: "moduleEntry"
  });

  return (
    <AppSectionStack>
      <AppSection
        eyebrow={translateKey(t, viewModel.mainSections[0].descriptionKey)}
        title={translateKey(t, viewModel.mainSections[0].titleKey)}
        useGrid={false}
      >
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          <Alert
            message={interactionMessage}
            showIcon
            style={{ borderRadius: token.borderRadiusLG }}
            type="info"
          />
          <AppCardGrid columns={2}>
            <ComposerCard
              draft={analysisDraft}
              onDraftChange={onAnalysisDraftChange}
              onSelectSuggestion={onSelectAnalysisSuggestion}
              onSubmit={onAnalysisSubmit}
              title={selectedSession.inputComposer.title}
              viewModel={selectedSession.inputComposer}
            />
            <ContextCard contextPanelNote={viewModel.contextPanelNote} session={selectedSession} />
          </AppCardGrid>
        </Space>
      </AppSection>

      <AppSection
        eyebrow={translateKey(t, viewModel.mainSections[1].descriptionKey)}
        title={translateKey(t, viewModel.mainSections[1].titleKey)}
        useGrid={false}
      >
        <AppCardGrid columns={2}>
          <SessionListCard
            onSelectSession={onSelectSession}
            selectedSessionKey={selectedSessionKey}
            sessions={viewModel.sessions}
          />
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <RunOverviewCard session={selectedSession} />
            <PlanTimelineCard session={selectedSession} />
          </Space>
        </AppCardGrid>
      </AppSection>

      <AppSection
        eyebrow={translateKey(t, viewModel.mainSections[2].descriptionKey)}
        title={translateKey(t, viewModel.mainSections[2].titleKey)}
        useGrid={false}
      >
        <AppCardGrid columns={2}>
          <EvidenceCard session={selectedSession} />
          <TraceSummaryCard action={traceAction} session={selectedSession} />
        </AppCardGrid>
      </AppSection>

      <AppSection
        eyebrow={translateKey(t, viewModel.mainSections[3].descriptionKey)}
        title={translateKey(t, viewModel.mainSections[3].titleKey)}
        useGrid={false}
      >
        <AppCardGrid columns={3}>
          <ResultSummaryCard session={selectedSession} />
          <ComposerCard
            draft={followUpDraft}
            onDraftChange={onFollowUpDraftChange}
            onSelectSuggestion={onSelectFollowUpSuggestion}
            onSubmit={onFollowUpSubmit}
            title={selectedSession.followUpComposer.title}
            viewModel={selectedSession.followUpComposer}
          />
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <FeedbackPanel
              helperText={selectedSession.feedback.helperText}
              onChange={onFeedbackChange}
              onSubmit={onFeedbackSubmit}
              options={selectedSession.feedback.options}
              submitLabel={selectedSession.feedback.submitLabel}
              targetTitle={selectedSession.feedback.targetTitle}
              title={selectedSession.feedback.title}
              value={feedbackValue}
            />
            <ReportSection
              actions={<AppActionGroup actions={[reportAction]} />}
              content={selectedSession.reportEntry.description}
              evidenceSummary={selectedSession.reportEntry.evidenceSummary}
              title={selectedSession.reportEntry.title}
            />
          </Space>
        </AppCardGrid>
      </AppSection>
    </AppSectionStack>
  );
}

type ComposerCardProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
  onSubmit: () => void;
  title: string;
  viewModel:
    | AnalysisViewModel["sessions"][number]["inputComposer"]
    | AnalysisViewModel["sessions"][number]["followUpComposer"];
};

function ComposerCard({
  draft,
  onDraftChange,
  onSelectSuggestion,
  onSubmit,
  title,
  viewModel
}: ComposerCardProps) {
  const { token } = theme.useToken();

  return (
    <AppBaseCard
      eyebrow={viewModel.contextHint}
      footerActions={
        <Button
          color="default"
          onClick={onSubmit}
          variant="solid"
          disabled={draft.trim().length === 0}
        >
          {viewModel.submitLabel}
        </Button>
      }
      meta={
        <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
          <Typography.Text type="secondary">建议输入</Typography.Text>
          <Space wrap>
            {viewModel.suggestions.map((suggestion) => (
              <Button
                key={suggestion.key}
                onClick={() => onSelectSuggestion(suggestion.label)}
                size="small"
                type="default"
              >
                {suggestion.label}
              </Button>
            ))}
          </Space>
        </Space>
      }
      title={title}
    >
      <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{viewModel.helperText}</Typography.Text>
        <TextArea
          aria-label={title}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={viewModel.placeholder}
          rows={5}
          value={draft}
        />
      </Space>
    </AppBaseCard>
  );
}

function ContextCard({
  contextPanelNote,
  session
}: {
  contextPanelNote: string;
  session: AnalysisViewModel["sessions"][number];
}) {
  const { t } = useI18n();
  const { token } = theme.useToken();

  return (
    <AppBaseCard
      description={contextPanelNote}
      eyebrow={session.session.contextLabel}
      title="当前分析上下文"
    >
      <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
        {session.contextItems.map((item) => (
          <div
            key={item.key}
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              padding: token.paddingSM
            }}
          >
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
                <Typography.Text type="secondary">{item.label}</Typography.Text>
                <Space wrap>
                  {item.status ? <StatusTag {...toStatusTag(t, item.status)!} /> : null}
                  {item.risk ? <RiskBadge {...toRiskBadge(t, item.risk)!} /> : null}
                </Space>
              </Space>
              <Typography.Text strong>{item.value}</Typography.Text>
              {item.meta ? <Typography.Text type="secondary">{item.meta}</Typography.Text> : null}
              {item.description ? (
                <Typography.Text type="secondary">{item.description}</Typography.Text>
              ) : null}
            </Space>
          </div>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function SessionListCard({
  onSelectSession,
  selectedSessionKey,
  sessions
}: {
  onSelectSession: (key: string) => void;
  selectedSessionKey: string;
  sessions: AnalysisViewModel["sessions"];
}) {
  const { t } = useI18n();
  const { token } = theme.useToken();

  return (
    <AppBaseCard
      description="静态会话切换只更新页面级 UI State，不做真实加载、搜索、分页或历史回放。"
      title="分析会话 / 历史入口"
    >
      <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
        {sessions.map((session) => {
          const isSelected = session.key === selectedSessionKey;
          const statusTag = toStatusTag(t, session.session.status);
          const riskBadge = toRiskBadge(t, session.session.risk);

          return (
            <button
              aria-pressed={isSelected}
              key={session.key}
              onClick={() => onSelectSession(session.key)}
              style={{
                appearance: "none",
                background: isSelected ? token.colorFillAlter : token.colorBgContainer,
                border: `1px solid ${
                  isSelected ? token.colorText : token.colorBorderSecondary
                }`,
                borderRadius: token.borderRadiusLG,
                cursor: "pointer",
                padding: token.padding,
                textAlign: "left",
                width: "100%"
              }}
              type="button"
            >
              <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
                <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
                  <Typography.Text strong>{session.session.title}</Typography.Text>
                  <Space wrap>
                    {statusTag ? <StatusTag {...statusTag} /> : null}
                    {riskBadge ? <RiskBadge {...riskBadge} /> : null}
                  </Space>
                </Space>
                <Typography.Text type="secondary">{session.session.summary}</Typography.Text>
                <Space wrap size={token.marginXS}>
                  <Typography.Text type="secondary">{session.session.contextLabel}</Typography.Text>
                  <Typography.Text type="secondary">{session.session.runLabel}</Typography.Text>
                  <Typography.Text type="secondary">
                    {session.session.updatedAtText}
                  </Typography.Text>
                </Space>
              </Space>
            </button>
          );
        })}
      </Space>
    </AppBaseCard>
  );
}

function RunOverviewCard({ session }: { session: AnalysisViewModel["sessions"][number] }) {
  const { t } = useI18n();
  const statusTag = toStatusTag(t, session.runOverview.status);
  const riskBadge = toRiskBadge(t, session.runOverview.risk);

  return (
    <AppBaseCard
      description={session.runOverview.stageSummary}
      eyebrow={session.runOverview.phaseLabel}
      tagSlot={
        <Space wrap>
          {statusTag ? <StatusTag {...statusTag} /> : null}
          {riskBadge ? <RiskBadge {...riskBadge} /> : null}
        </Space>
      }
      title={session.runOverview.title}
    >
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Typography.Text strong>{session.runOverview.ownerLabel}</Typography.Text>
        <Typography.Text type="secondary">{session.runOverview.toolSummary}</Typography.Text>
        <Typography.Text type="secondary">{session.runOverview.updatedAtText}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function PlanTimelineCard({ session }: { session: AnalysisViewModel["sessions"][number] }) {
  const { t } = useI18n();

  return (
    <AppBaseCard
      description="Plan / Step / Tool Calling 只表达未来 Runtime 如何进入页面，不展示真实 raw tool output。"
      title="Plan / Step / Tool Calling"
    >
      <TraceTimeline
        items={session.planSteps.map((step) => ({
          description: step.description ?? step.meta,
          key: step.key,
          risk: toRiskBadge(t, step.risk),
          status: toStatusTag(t, step.status),
          timestampText: step.timestampText,
          title: step.title
        }))}
      />
    </AppBaseCard>
  );
}

function EvidenceCard({ session }: { session: AnalysisViewModel["sessions"][number] }) {
  const { t } = useI18n();

  return (
    <AppBaseCard
      description="Evidence / RAG 来源只展示静态摘要，不做真实检索、引用解析或知识库接入。"
      title="Evidence / RAG 来源"
    >
      <SourceEvidenceList
        items={session.evidenceItems.map((item) => ({
          confidenceText: item.confidenceText,
          key: item.key,
          risk: toRiskBadge(t, item.risk),
          sourceTypeLabel: item.sourceTypeLabel,
          summary: item.relatedContext ? `${item.summary} ${item.relatedContext}` : item.summary,
          title: item.title
        }))}
      />
    </AppBaseCard>
  );
}

function TraceSummaryCard({
  action,
  session
}: {
  action: ReturnType<typeof createRouteAction>;
  session: AnalysisViewModel["sessions"][number];
}) {
  const { t } = useI18n();
  const statusTag = toStatusTag(t, session.traceSummary.status);
  const riskBadge = toRiskBadge(t, session.traceSummary.risk);

  return (
    <AppBaseCard
      description={session.traceSummary.description}
      eyebrow={session.traceSummary.updatedAtText}
      footerActions={<AppActionGroup actions={[action]} />}
      tagSlot={
        <Space wrap>
          {statusTag ? <StatusTag {...statusTag} /> : null}
          {riskBadge ? <RiskBadge {...riskBadge} /> : null}
        </Space>
      }
      title={session.traceSummary.title}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text strong>{session.traceSummary.eventCountText}</Typography.Text>
        <TraceTimeline
          items={session.traceSummary.items.map((item) => ({
            description: item.description ?? item.meta,
            key: item.key,
            risk: toRiskBadge(t, item.risk),
            status: toStatusTag(t, item.status),
            timestampText: item.timestampText,
            title: item.title
          }))}
        />
      </Space>
    </AppBaseCard>
  );
}

function ResultSummaryCard({ session }: { session: AnalysisViewModel["sessions"][number] }) {
  const { t } = useI18n();
  const statusTag = toStatusTag(t, session.resultSummary.status);
  const riskBadge = toRiskBadge(t, session.resultSummary.risk);

  return (
    <AppBaseCard
      description={session.resultSummary.conclusion}
      tagSlot={
        <Space wrap>
          {statusTag ? <StatusTag {...statusTag} /> : null}
          {riskBadge ? <RiskBadge {...riskBadge} /> : null}
        </Space>
      }
      title={session.resultSummary.title}
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <div>
          <Typography.Text strong>关键发现</Typography.Text>
          <List
            dataSource={session.resultSummary.findingBullets}
            renderItem={(item) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Typography.Text>{item}</Typography.Text>
              </List.Item>
            )}
            split={false}
          />
        </div>
        <div>
          <Typography.Text strong>建议动作</Typography.Text>
          <List
            dataSource={session.resultSummary.actionSuggestions}
            renderItem={(item) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Typography.Text>{item}</Typography.Text>
              </List.Item>
            )}
            split={false}
          />
        </div>
        <Typography.Text type="secondary">{session.resultSummary.evidenceSummary}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}
