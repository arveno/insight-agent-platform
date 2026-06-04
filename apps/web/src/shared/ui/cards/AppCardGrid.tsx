import { Children } from "react";
import { Col, Row, theme, type ColProps } from "antd";

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

export function AppCardGrid({ children, columns = 2, gutter }: AppCardGridProps) {
  const { token } = theme.useToken();
  const items = Children.toArray(children);
  const resolvedGutter: [number, number] = gutter ?? [token.margin, token.margin];

  if (items.length === 0) {
    return null;
  }

  return (
    <Row align="stretch" gutter={resolvedGutter}>
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
