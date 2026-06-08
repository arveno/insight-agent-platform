import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

import type { AnalysisViewModel } from "../../modules/analysis/models/analysisViewModel";
import { ObjectListNav } from "../../shared/layout/shell/ObjectListNav";

export type AnalysisSessionNavProps = {
  onBack: () => void;
  onCreateNewAnalysis: () => void;
  onSearchChange: (value: string) => void;
  onSelectSession: (key: string) => void;
  searchValue: string;
  selectedSessionKey: string;
  sessions: AnalysisViewModel["sessions"];
};

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
          新聊天
        </Button>
      }
      ariaLabel="Analysis session navigation"
      emptyText="暂无匹配会话"
      items={sessions.map((session) => ({
        key: session.key,
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
