import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

import type { AnalysisViewModel } from "../../features/static-view-models";
import { ObjectListNav, StatusTag } from "../../shared";

export type AnalysisSessionNavProps = {
  onBack: () => void;
  onCreateNewAnalysis: () => void;
  onSearchChange: (value: string) => void;
  onSelectSession: (key: string) => void;
  searchValue: string;
  selectedSessionKey: string;
  sessions: AnalysisViewModel["sessions"];
};

const statusLabelByKey = {
  disabled: "不可操作",
  empty: "暂无数据",
  error: "错误态",
  loading: "加载中",
  ready: "就绪",
  readonly: "只读",
  risk: "存在风险",
  success: "成功",
  warning: "注意"
} as const;

export function AnalysisSessionNav({
  onBack,
  onCreateNewAnalysis,
  onSearchChange,
  onSelectSession,
  searchValue,
  selectedSessionKey,
  sessions
}: AnalysisSessionNavProps) {
  return (
    <ObjectListNav
      action={
        <Button icon={<PlusOutlined />} onClick={onCreateNewAnalysis} type="default">
          新建分析
        </Button>
      }
      ariaLabel="Analysis session navigation"
      emptyText="暂无匹配会话"
      items={sessions.map((session) => ({
        description: session.session.summary,
        key: session.key,
        meta: `${session.session.contextLabel} · ${session.session.updatedAtText}`,
        status: (
          <StatusTag
            label={statusLabelByKey[session.session.status.status] ?? "就绪"}
            tone={
              session.session.status.status === "loading"
                ? "processing"
                : session.session.status.status === "warning" ||
                    session.session.status.status === "risk"
                  ? "warning"
                  : session.session.status.status === "success" ||
                      session.session.status.status === "ready"
                    ? "success"
                    : "default"
            }
          />
        ),
        title: session.session.title
      }))}
      onBack={onBack}
      onSearchChange={onSearchChange}
      onSelect={onSelectSession}
      searchLabel="搜索会话"
      searchPlaceholder="搜索会话"
      searchValue={searchValue}
      selectedKey={selectedSessionKey}
      title="分析"
    />
  );
}
