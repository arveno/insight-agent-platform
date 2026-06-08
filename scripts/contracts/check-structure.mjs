import { existsSync, readFileSync, readdirSync } from "node:fs";

const appSections = ["providers", "router", "shell"];
const frontendModules = [
  "workspace",
  "dashboard",
  "analysis",
  "data-knowledge",
  "metrics",
  "reports",
  "platform-operations",
  "model-tools",
  "governance",
  "settings",
  "evaluation",
  "feedback",
  "memory",
  "observability"
];
const sharedRootLayers = [
  "ui",
  "layout",
  "navigation",
  "theme",
  "graph",
  "charts",
  "i18n",
  "icons",
  "utils",
  "view-model",
  "test"
];
const frontendRequiredPaths = [
  "apps/web/src/main.tsx",
  "apps/web/src/api",
  "apps/web/src/api/client",
  "apps/web/src/api/adapters",
  ...appSections.map((section) => `apps/web/src/app/${section}`),
  ...frontendModules.map((moduleDir) => `apps/web/src/modules/${moduleDir}`),
  ...sharedRootLayers.map((layer) => `apps/web/src/shared/${layer}`),
  "apps/web/src/shared/ui/actions",
  "apps/web/src/shared/ui/cards",
  "apps/web/src/shared/ui/lists",
  "apps/web/src/shared/ui/states",
  "apps/web/src/shared/ui/status",
  "apps/web/src/shared/layout/containers",
  "apps/web/src/shared/layout/panels",
  "apps/web/src/shared/layout/sections"
];
const forbiddenFrontendPaths = [
  "apps/web/src/pages",
  "apps/web/src/features",
  "apps/web/src/pages/_shared",
  "apps/web/src/pages/_legacy",
  "apps/web/src/features/static-view-models.ts",
  "apps/web/src/shared/api",
  "apps/web/src/shared/hooks",
  "apps/web/src/shared/stores",
  "apps/web/src/shared/types",
  "apps/web/src/shared/constants",
  "apps/web/src/shared/ui/data",
  "apps/web/src/shared/ui/feedback",
  "apps/web/src/shared/ui/navigation",
  "apps/web/src/shared/ui/evidence",
  "apps/web/src/shared/ui/report",
  "apps/web/src/shared/ui/reports",
  "apps/web/src/shared/ui/trace",
  "apps/web/src/shared/ui/traces",
  "apps/web/src/shared/ui/feedback-panel",
  "apps/web/src/shared/layout/shell",
  "apps/web/src/shared/layout/overlays",
  "apps/web/src/shared/ui/actions/AppActionButton.tsx",
  "apps/web/src/shared/ui/actions/AppActionGroup.tsx",
  "apps/web/src/shared/ui/actions/ActionGroup.tsx",
  "apps/web/src/shared/ui/actions/RouteActionGroup.tsx",
  "apps/web/src/shared/ui/actions/ActionBar.tsx",
  "apps/web/src/shared/ui/cards/AppBaseCard.tsx",
  "apps/web/src/shared/ui/cards/AppCardGrid.tsx",
  "apps/web/src/shared/ui/cards/MetricCard.tsx",
  "apps/web/src/shared/ui/cards/MetricCardGrid.tsx",
  "apps/web/src/shared/ui/data/AppPropertyList.tsx",
  "apps/web/src/shared/ui/data/SummaryTable.tsx",
  "apps/web/src/shared/ui/data/SummaryCardGrid.tsx",
  "apps/web/src/shared/layout/sections/AppSection.tsx",
  "apps/web/src/shared/layout/sections/AppSectionStack.tsx",
  "apps/web/src/shared/layout/sections/WebSection.tsx",
  "apps/web/src/shared/ui/navigation/AppTabs.tsx",
  "apps/web/src/shared/layout/overlays/StaticTabsPanel.tsx",
  "apps/web/src/shared/layout/overlays/AppTabs.tsx"
];
const businessBoundaryPrefixes = [
  "Analysis",
  "DataKnowledge",
  "Metrics",
  "Reports",
  "ModelTools",
  "Governance",
  "Settings",
  "Evaluation",
  "Feedback",
  "Memory",
  "Observability",
  "PlatformOperations"
];
const sharedLayoutForbiddenPrefixes = [
  ...businessBoundaryPrefixes,
  "Report",
  "Evidence",
  "Trace",
  "Feedback"
];
const forbiddenSharedNamePrefixes = ["App", "Base", "Wrapper", "Common", "Shared", "Generic", "Universal"];
const forbiddenSharedUiDirs = ["evidence", "report", "reports", "trace", "traces", "feedback-panel"];
const contractSchemaPaths = [
  "packages/contracts/schemas/workspace/workspace.schema.json",
  "packages/contracts/schemas/workspace/user.schema.json",
  "packages/contracts/schemas/workspace/role.schema.json",
  "packages/contracts/schemas/workspace/business-domain.schema.json",
  "packages/contracts/schemas/data-knowledge/data-source.schema.json",
  "packages/contracts/schemas/data-knowledge/data-table.schema.json",
  "packages/contracts/schemas/data-knowledge/data-field.schema.json",
  "packages/contracts/schemas/data-knowledge/knowledge-document.schema.json",
  "packages/contracts/schemas/data-knowledge/knowledge-chunk.schema.json",
  "packages/contracts/schemas/metrics/metric.schema.json",
  "packages/contracts/schemas/metrics/metric-formula.schema.json",
  "packages/contracts/schemas/metrics/metric-threshold.schema.json",
  "packages/contracts/schemas/metrics/metric-lineage.schema.json",
  "packages/contracts/schemas/analysis/analysis-task.schema.json",
  "packages/contracts/schemas/analysis/analysis-run.schema.json",
  "packages/contracts/schemas/analysis/run-event.schema.json",
  "packages/contracts/schemas/analysis/tool-call.schema.json",
  "packages/contracts/schemas/analysis/model-call.schema.json",
  "packages/contracts/schemas/analysis/source-evidence.schema.json",
  "packages/contracts/schemas/memory/memory-item.schema.json",
  "packages/contracts/schemas/feedback/feedback.schema.json",
  "packages/contracts/schemas/evaluation/evaluation-run.schema.json",
  "packages/contracts/schemas/evaluation/evaluation-dataset.schema.json",
  "packages/contracts/schemas/evaluation/evaluation-score.schema.json",
  "packages/contracts/schemas/evaluation/bad-case.schema.json",
  "packages/contracts/schemas/model-tools/prompt-version.schema.json",
  "packages/contracts/schemas/model-tools/tool-definition.schema.json",
  "packages/contracts/schemas/model-tools/rag-strategy.schema.json",
  "packages/contracts/schemas/model-tools/model-config.schema.json",
  "packages/contracts/schemas/model-tools/routing-policy.schema.json",
  "packages/contracts/schemas/governance/audit-log.schema.json",
  "packages/contracts/schemas/governance/permission-policy.schema.json",
  "packages/contracts/schemas/governance/risk-rule.schema.json",
  "packages/contracts/schemas/reports/report.schema.json",
  "packages/contracts/schemas/reports/report-section.schema.json",
  "packages/contracts/schemas/reports/decision.schema.json",
  "packages/contracts/schemas/reports/action-suggestion.schema.json",
  "packages/contracts/schemas/platform-operations/job.schema.json",
  "packages/contracts/schemas/platform-operations/notification.schema.json",
  "packages/contracts/schemas/platform-operations/data-quality-check.schema.json"
];
const contractSchemaDomains = [
  "workspace",
  "data-knowledge",
  "metrics",
  "analysis",
  "memory",
  "feedback",
  "evaluation",
  "model-tools",
  "governance",
  "reports",
  "platform-operations"
];
const backendFiles = [
  "services/agent-runtime/README.md",
  "services/agent-runtime/src/__init__.py",
  "services/agent-runtime/src/app/__init__.py",
  "services/agent-runtime/src/app/config.py",
  "services/agent-runtime/src/app/main.py",
  "services/agent-runtime/src/app/routes/__init__.py",
  "services/agent-runtime/src/app/routes/health.py",
  "services/agent-runtime/src/shared/errors/runtime.py",
  "services/agent-runtime/src/shared/utils/logging.py",
  "services/agent-runtime/src/shared/types/health.py",
  "services/agent-runtime/src/modules/workspace/workspace_service.py",
  "services/agent-runtime/src/modules/workspace/iam_service.py",
  "services/agent-runtime/src/modules/workspace/user_memory.py",
  "services/agent-runtime/src/modules/workspace/workspace_memory.py",
  "services/agent-runtime/src/modules/conversations/analysis_service.py",
  "services/agent-runtime/src/modules/conversations/memory_service.py",
  "services/agent-runtime/src/modules/conversations/analysis_memory.py",
  "services/agent-runtime/src/modules/agent_runs/evaluation_service.py",
  "services/agent-runtime/src/modules/agent_runs/observability_service.py",
  "services/agent-runtime/src/modules/agent_runs/regression.py",
  "services/agent-runtime/src/modules/data_knowledge/data_source_service.py",
  "services/agent-runtime/src/modules/data_knowledge/knowledge_service.py",
  "services/agent-runtime/src/modules/model_tools/model_tool_service.py",
  "services/agent-runtime/src/modules/governance/governance_service.py",
  "services/agent-runtime/src/modules/governance/audit.py",
  "services/agent-runtime/src/modules/governance/data_access.py",
  "services/agent-runtime/src/modules/governance/policy_engine.py",
  "services/agent-runtime/src/modules/governance/sql_guard.py",
  "services/agent-runtime/src/modules/governance/tool_permission.py",
  "services/agent-runtime/src/modules/metrics/metric_service.py",
  "services/agent-runtime/src/modules/metrics/dashboard_service.py",
  "services/agent-runtime/src/modules/reports/report_service.py",
  "services/agent-runtime/src/modules/reports/feedback_service.py",
  "services/agent-runtime/src/modules/reports/decision_memory.py",
  "services/agent-runtime/src/modules/platform_operations/platform_operation_service.py",
  "services/agent-runtime/src/infrastructure/model_gateway/gateway.py",
  "services/agent-runtime/src/infrastructure/model_gateway/routing.py",
  "services/agent-runtime/src/infrastructure/model_gateway/cost.py",
  "services/agent-runtime/src/infrastructure/model_gateway/errors.py",
  "services/agent-runtime/src/infrastructure/tool_registry/registry.py",
  "services/agent-runtime/src/infrastructure/tool_registry/sql_tool.py",
  "services/agent-runtime/src/infrastructure/tool_registry/metric_tool.py",
  "services/agent-runtime/src/infrastructure/tool_registry/memory_tool.py",
  "services/agent-runtime/src/infrastructure/tool_registry/report_tool.py",
  "services/agent-runtime/src/infrastructure/tool_registry/mcp_adapter.py",
  "services/agent-runtime/src/infrastructure/rag/rag_tool.py",
  "services/agent-runtime/src/infrastructure/observability/trace.py",
  "services/agent-runtime/src/infrastructure/observability/metrics.py",
  "services/agent-runtime/src/infrastructure/observability/logging.py",
  "services/agent-runtime/src/infrastructure/observability/cost.py"
];
const moduleDirs = [
  "workspace",
  "conversations",
  "agent_runs",
  "data_knowledge",
  "model_tools",
  "governance",
  "metrics",
  "reports",
  "platform_operations"
];
const infrastructureDirs = [
  "database",
  "auth",
  "model_gateway",
  "tool_registry",
  "rag",
  "observability"
];
const sharedDirs = ["errors", "validation", "utils", "types"];
const testDirs = ["unit", "contract", "integration", "smoke", "failure_simulation"];
const databasePaths = [
  "database",
  "database/mysql",
  "database/mysql/README.md",
  "database/mysql/migrations",
  "database/mysql/migrations/README.md",
  "database/mysql/seeds",
  "database/mysql/seeds/README.md",
  "database/mysql/queries",
  "database/mysql/queries/README.md",
  "database/mysql/diagrams",
  "database/mysql/diagrams/README.md"
];
const scriptAutomationPaths = [
  "scripts/verify",
  "scripts/verify/README.md",
  "scripts/build",
  "scripts/build/README.md",
  "scripts/package",
  "scripts/package/README.md",
  "scripts/rollback",
  "scripts/rollback/README.md",
  "scripts/migration",
  "scripts/migration/README.md",
  "scripts/security",
  "scripts/security/README.md"
];

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "docs/workflow.md",
  "docs/database.md",
  "docs/architecture.md",
  "docs/contracts.md",
  "docs/deployment.md",
  "services/agent-runtime/pyproject.toml",
  "packages/contracts/package.json",
  "packages/contracts/schemas",
  "packages/contracts/openapi/agent-runtime.openapi.yaml",
  "packages/contracts/generated/typescript",
  "packages/contracts/generated/python",
  "services/agent-runtime/src",
  "services/agent-runtime/src/app",
  "services/agent-runtime/src/app/middlewares",
  "services/agent-runtime/src/app/routes",
  "services/agent-runtime/src/modules",
  "services/agent-runtime/src/infrastructure",
  "services/agent-runtime/src/shared",
  "services/agent-runtime/tests/smoke",
  "deploy/docker",
  "deploy/cloudbase-run",
  "scripts/contracts",
  "scripts/smoke",
  "scripts/load",
  "scripts/failure-simulation",
  "scripts/deploy"
];

requiredPaths.push(
  ...frontendRequiredPaths,
  ...contractSchemaDomains.map((domain) => `packages/contracts/schemas/${domain}`),
  ...contractSchemaPaths,
  ...backendFiles,
  ...moduleDirs.map((dir) => `services/agent-runtime/src/modules/${dir}`),
  ...infrastructureDirs.map((dir) => `services/agent-runtime/src/infrastructure/${dir}`),
  ...sharedDirs.map((dir) => `services/agent-runtime/src/shared/${dir}`),
  ...testDirs.map((dir) => `services/agent-runtime/tests/${dir}`),
  ...databasePaths,
  ...scriptAutomationPaths
);

const missingPaths = requiredPaths.filter((path) => !existsSync(path));
const forbiddenPaths = forbiddenFrontendPaths.filter((path) => existsSync(path));
const flatSchemaFiles = readdirSync("packages/contracts/schemas", { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".schema.json"))
  .map((entry) => `packages/contracts/schemas/${entry.name}`);
const frontendIndexFiles = collectMatchingEntries("apps/web/src", (entry, absolutePath) =>
  entry.isFile() && (absolutePath.endsWith("/index.ts") || absolutePath.endsWith("/index.tsx"))
);
const appShellBusinessFiles = collectMatchingEntries("apps/web/src/app/shell", (entry) =>
  entry.isFile() && businessBoundaryPrefixes.some((prefix) => entry.name.startsWith(prefix))
);
const sharedLayoutBusinessFiles = collectMatchingEntries("apps/web/src/shared/layout", (entry) =>
  entry.isFile() && sharedLayoutForbiddenPrefixes.some((prefix) => entry.name.startsWith(prefix))
);
const sharedUiLegacyNames = collectNamedEntryViolations("apps/web/src/shared/ui", forbiddenSharedNamePrefixes);
const sharedLayoutLegacyNames = collectNamedEntryViolations("apps/web/src/shared/layout", forbiddenSharedNamePrefixes);
const sharedNavigationLegacyNames = collectNamedEntryViolations(
  "apps/web/src/shared/navigation",
  forbiddenSharedNamePrefixes
);
const sharedUiBusinessDirs = collectMatchingEntries("apps/web/src/shared/ui", (entry, absolutePath) =>
  entry.isDirectory() && forbiddenSharedUiDirs.includes(entry.name) && absolutePath !== "apps/web/src/shared/ui"
);
const sharedDependencyViolations = collectImportViolations("apps/web/src/shared", [
  { pattern: /\bfrom\s+["'][^"']*app\//, message: "shared 不得依赖 app" },
  { pattern: /\bfrom\s+["'][^"']*modules\//, message: "shared 不得依赖 modules" }
]);
const sharedNavigationDependencyViolations = collectImportViolations("apps/web/src/shared/navigation", [
  { pattern: /\bfrom\s+["'][^"']*app\//, message: "shared/navigation 不得依赖 app" },
  { pattern: /\bfrom\s+["'][^"']*modules\//, message: "shared/navigation 不得依赖 modules" }
]);
const moduleDependencyViolations = collectImportViolations("apps/web/src/modules", [
  { pattern: /\bfrom\s+["'][^"']*app\//, message: "modules 不得依赖 app" }
]);

if (missingPaths.length > 0) {
  fail("Missing required project structure:", missingPaths);
}

if (flatSchemaFiles.length > 0) {
  fail("Schema 文件必须按业务域分组，不能平铺在 packages/contracts/schemas 根目录：", flatSchemaFiles);
}

if (forbiddenPaths.length > 0) {
  fail("Detected forbidden frontend legacy paths:", forbiddenPaths);
}

if (frontendIndexFiles.length > 0) {
  fail("apps/web/src 不允许存在 index.ts / index.tsx：", frontendIndexFiles);
}

if (appShellBusinessFiles.length > 0) {
  fail("apps/web/src/app/shell 只允许保留通用 App Shell 组件，检测到业务前缀文件：", appShellBusinessFiles);
}

if (sharedLayoutBusinessFiles.length > 0) {
  fail("apps/web/src/shared/layout 只允许无业务语义布局 primitive，检测到业务命名文件：", sharedLayoutBusinessFiles);
}

if (sharedUiLegacyNames.length > 0) {
  fail("apps/web/src/shared/ui 检测到禁止的旧式命名前缀：", sharedUiLegacyNames);
}

if (sharedLayoutLegacyNames.length > 0) {
  fail("apps/web/src/shared/layout 检测到禁止的旧式命名前缀：", sharedLayoutLegacyNames);
}

if (sharedNavigationLegacyNames.length > 0) {
  fail("apps/web/src/shared/navigation 检测到禁止的旧式命名前缀：", sharedNavigationLegacyNames);
}

if (sharedUiBusinessDirs.length > 0) {
  fail("apps/web/src/shared/ui 不允许出现业务目录：", sharedUiBusinessDirs);
}

if (sharedDependencyViolations.length > 0) {
  fail("apps/web/src/shared 检测到越界依赖：", sharedDependencyViolations);
}

if (sharedNavigationDependencyViolations.length > 0) {
  fail("apps/web/src/shared/navigation 检测到越界依赖：", sharedNavigationDependencyViolations);
}

if (moduleDependencyViolations.length > 0) {
  fail("apps/web/src/modules 检测到越界依赖：", moduleDependencyViolations);
}

console.log("Structure guard passed.");

function fail(title, items) {
  console.error(title);
  for (const item of items) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

function collectMatchingEntries(rootDir, predicate) {
  if (!existsSync(rootDir)) {
    return [];
  }

  return collectDirectoryEntries(rootDir, predicate);
}

function collectDirectoryEntries(currentDir, predicate) {
  const matches = [];

  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const absolutePath = `${currentDir}/${entry.name}`;

    if (predicate(entry, absolutePath)) {
      matches.push(absolutePath);
    }

    if (entry.isDirectory()) {
      matches.push(...collectDirectoryEntries(absolutePath, predicate));
    }
  }

  return matches;
}

function collectNamedEntryViolations(rootDir, prefixes) {
  return collectMatchingEntries(rootDir, (entry, absolutePath) => {
    if (absolutePath === rootDir) {
      return false;
    }

    return prefixes.some((prefix) => entry.name.startsWith(prefix));
  });
}

function collectImportViolations(rootDir, rules) {
  const files = collectMatchingEntries(rootDir, (entry) =>
    entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
  );
  const violations = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");

    for (const [lineIndex, line] of content.split("\n").entries()) {
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          violations.push(`${file}:${lineIndex + 1} ${rule.message}`);
        }
      }
    }
  }

  return violations;
}
