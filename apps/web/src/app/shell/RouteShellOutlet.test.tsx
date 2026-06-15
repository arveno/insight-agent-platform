import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../shared/test/TestProviders";

const useAnalysisShellSlotsMock = vi.fn();
const useDashboardShellSlotsMock = vi.fn();
const useReportsShellSlotsMock = vi.fn();
const useDataKnowledgeShellSlotsMock = vi.fn();
const useMetricsShellSlotsMock = vi.fn();

vi.mock("../../modules/analysis/hooks/useAnalysisShellSlots", () => ({
  useAnalysisShellSlots: (params: unknown) => useAnalysisShellSlotsMock(params)
}));

vi.mock("../../modules/dashboard/Page", () => ({
  useDashboardShellSlots: (params: unknown) => useDashboardShellSlotsMock(params)
}));

vi.mock("../../modules/reports/hooks/useReportsShellSlots", () => ({
  useReportsShellSlots: (params: unknown) => useReportsShellSlotsMock(params)
}));

vi.mock("../../modules/data-knowledge/hooks/useDataKnowledgeShellSlots", () => ({
  useDataKnowledgeShellSlots: (params: unknown) => useDataKnowledgeShellSlotsMock(params)
}));

vi.mock("../../modules/metrics/hooks/useMetricsShellSlots", () => ({
  useMetricsShellSlots: (params: unknown) => useMetricsShellSlotsMock(params)
}));

import { RouteShellOutlet } from "./RouteShellOutlet";

afterEach(cleanup);

beforeEach(() => {
  useAnalysisShellSlotsMock.mockReset();
  useDashboardShellSlotsMock.mockReset();
  useReportsShellSlotsMock.mockReset();
  useDataKnowledgeShellSlotsMock.mockReset();
  useMetricsShellSlotsMock.mockReset();
});

describe("RouteShellOutlet", () => {
  it("mounts the dashboard shell hook when the dashboard route provides shell slots", () => {
    useDashboardShellSlotsMock.mockReturnValue({
      mainContent: <div>dashboard main</div>,
      rightAssistPanel: <div>dashboard inspector</div>
    });

    render(
      <TestProviders>
        <RouteShellOutlet
          activeRoute="dashboard"
          defaultMainContent={<div>default main</div>}
          header={<div>header</div>}
          leftNavMode="root"
          onBackToRoot={vi.fn()}
          onNavigate={vi.fn()}
          renderLeftNav={(content) => <div data-testid="left-nav">{content}</div>}
          rootLeftNavContent={<div>root nav</div>}
          selectedBusinessDomainId="business-domain-revenue-quality"
          selectedWorkspace={{
            name: "Northstar Retail China",
            workspaceId: "workspace-northstar-retail-china"
          }}
        />
      </TestProviders>
    );

    expect(useAnalysisShellSlotsMock).not.toHaveBeenCalled();
    expect(useDashboardShellSlotsMock).toHaveBeenCalledTimes(1);
    expect(useReportsShellSlotsMock).not.toHaveBeenCalled();
    expect(useDataKnowledgeShellSlotsMock).not.toHaveBeenCalled();
    expect(useMetricsShellSlotsMock).not.toHaveBeenCalled();
    expect(screen.getByText("root nav")).toBeTruthy();
    expect(screen.getByText("dashboard main")).toBeTruthy();
    expect(screen.getByText("dashboard inspector")).toBeTruthy();
    expect(screen.queryByText("default main")).toBeNull();
  });

  it("mounts only the active route shell hook", () => {
    useReportsShellSlotsMock.mockReturnValue({
      leftNav: <div>reports nav</div>,
      mainContent: <div>reports main</div>
    });

    render(
      <TestProviders>
        <RouteShellOutlet
          activeRoute="reports"
          defaultMainContent={<div>default main</div>}
          header={<div>header</div>}
          leftNavMode="reports"
          onBackToRoot={vi.fn()}
          onNavigate={vi.fn()}
          renderLeftNav={(content) => <div data-testid="left-nav">{content}</div>}
          rootLeftNavContent={<div>root nav</div>}
          selectedBusinessDomainId="business-domain-revenue-quality"
          selectedWorkspace={{
            name: "Northstar Retail China",
            workspaceId: "workspace-northstar-retail-china"
          }}
        />
      </TestProviders>
    );

    expect(useAnalysisShellSlotsMock).not.toHaveBeenCalled();
    expect(useDashboardShellSlotsMock).not.toHaveBeenCalled();
    expect(useReportsShellSlotsMock).toHaveBeenCalledTimes(1);
    expect(useDataKnowledgeShellSlotsMock).not.toHaveBeenCalled();
    expect(useMetricsShellSlotsMock).not.toHaveBeenCalled();
    expect(screen.getByText("reports nav")).toBeTruthy();
    expect(screen.getByText("reports main")).toBeTruthy();
    expect(screen.queryByText("default main")).toBeNull();
  });
});
