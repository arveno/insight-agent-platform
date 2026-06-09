import type { ReactNode } from "react";

/**
 * AppShell region override slots.
 *
 * Modules may provide any subset of the shell regions; omitted regions fall back
 * to the global AppShell defaults.
 */
export type ShellRegionSlots = {
  leftNav?: ReactNode;
  mainContent?: ReactNode;
  rightAssistPanel?: ReactNode;
};
