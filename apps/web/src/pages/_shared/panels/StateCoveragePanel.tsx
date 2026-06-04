import { Card, Col, Row, Space, Typography } from "antd";

import type { StaticPageStateCoverageViewModel } from "../../../app/models";
import { StatusTag, useI18n } from "../../../shared";
import { pageStateMessage, pageStateTitle, toStatusTag } from "../adapters";
import { translateKey } from "../text";

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
