import { Children } from "react";
import { Col, Row, type ColProps } from "antd";

import type { AppCardGridColumns, AppCardGridProps } from "./cardTypes";

const columnPropsByColumns: Record<
  AppCardGridColumns,
  Pick<ColProps, "lg" | "md" | "xl" | "xs">
> = {
  1: { xs: 24 },
  2: { lg: 12, xs: 24 },
  3: { md: 12, xl: 8, xs: 24 },
  4: { md: 12, xl: 6, xs: 24 }
};

export function AppCardGrid({ children, columns = 2, gutter = [16, 16] }: AppCardGridProps) {
  const items = Children.toArray(children);

  if (items.length === 0) {
    return null;
  }

  return (
    <Row align="stretch" gutter={gutter}>
      {items.map((child, index) => (
        <Col
          {...columnPropsByColumns[columns]}
          key={index}
          style={{ display: "flex", justifyContent: "flex-start" }}
        >
          <div style={{ display: "flex", width: "100%" }}>{child}</div>
        </Col>
      ))}
    </Row>
  );
}
