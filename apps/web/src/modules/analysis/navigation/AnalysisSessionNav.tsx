import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { SelectableList } from "../../../shared/ui/lists/SelectableList";
import type { AnalysisSessionViewModel } from "../models/analysisViewModel";

export type AnalysisSessionNavProps = {
  onBack: () => void;
  onCreateNewAnalysis: () => void;
  onSearchChange: (value: string) => void;
  onSelectSession: (conversationId: string) => void;
  searchValue: string;
  selectedConversationId: string | null;
  sessions: AnalysisSessionViewModel[];
};

export function AnalysisSessionNav({
  onBack,
  onCreateNewAnalysis,
  onSearchChange,
  onSelectSession,
  searchValue,
  selectedConversationId,
  sessions
}: AnalysisSessionNavProps) {
  return (
    <SelectableList
      action={
        <Button icon={<PlusOutlined />} onClick={onCreateNewAnalysis} type="default">
          新聊天
        </Button>
      }
      ariaLabel="Analysis session navigation"
      emptyText="暂无匹配会话"
      items={sessions.map((session) => ({
        key: session.conversationId,
        title: session.sessionSummary.title
      }))}
      onBack={onBack}
      onSearchChange={onSearchChange}
      onSelect={onSelectSession}
      searchLabel="搜索会话"
      searchPlaceholder="搜索会话"
      searchValue={searchValue}
      selectedKey={selectedConversationId ?? undefined}
      title="分析"
    />
  );
}
