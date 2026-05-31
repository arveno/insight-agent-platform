import { existsSync } from "node:fs";

const appSections = ["router", "providers", "layout", "theme"];
const pages = [
  "workspace",
  "data-knowledge",
  "metrics",
  "dashboard",
  "analysis",
  "reports",
  "memory",
  "feedback",
  "evaluation",
  "model-tools",
  "governance",
  "observability",
  "settings",
  "platform-operations"
];
const features = [
  "workspace",
  "data-knowledge",
  "metrics",
  "dashboard",
  "agent-analysis",
  "memory",
  "feedback",
  "evaluation",
  "model-tools",
  "governance",
  "observability",
  "reports",
  "settings",
  "platform-operations"
];
const featureLayers = ["api", "models", "mappers", "components", "pages", "hooks"];
const sharedLayers = [
  "api",
  "ui",
  "layout",
  "charts",
  "theme",
  "hooks",
  "stores",
  "types",
  "utils",
  "constants"
];
const contractSchemas = [
  "workspace",
  "user",
  "role",
  "business-domain",
  "data-source",
  "data-table",
  "data-field",
  "knowledge-document",
  "knowledge-chunk",
  "metric",
  "metric-formula",
  "metric-threshold",
  "metric-lineage",
  "analysis-task",
  "analysis-run",
  "run-event",
  "tool-call",
  "model-call",
  "source-evidence",
  "memory-item",
  "feedback",
  "evaluation-run",
  "evaluation-dataset",
  "evaluation-score",
  "bad-case",
  "prompt-version",
  "tool-definition",
  "rag-strategy",
  "model-config",
  "routing-policy",
  "report",
  "report-section",
  "decision",
  "action-suggestion",
  "audit-log",
  "permission-policy",
  "risk-rule",
  "job",
  "notification",
  "data-quality-check"
];
const agents = [
  "orchestrator",
  "data_analyst",
  "knowledge",
  "memory",
  "report",
  "evaluation",
  "governance"
];
const backendFiles = [
  "services/agent-runtime/app/application/workspace_service.py",
  "services/agent-runtime/app/application/iam_service.py",
  "services/agent-runtime/app/application/data_source_service.py",
  "services/agent-runtime/app/application/knowledge_service.py",
  "services/agent-runtime/app/application/metric_service.py",
  "services/agent-runtime/app/application/analysis_service.py",
  "services/agent-runtime/app/application/memory_service.py",
  "services/agent-runtime/app/application/feedback_service.py",
  "services/agent-runtime/app/application/evaluation_service.py",
  "services/agent-runtime/app/application/model_tool_service.py",
  "services/agent-runtime/app/application/governance_service.py",
  "services/agent-runtime/app/application/observability_service.py",
  "services/agent-runtime/app/application/report_service.py",
  "services/agent-runtime/app/application/dashboard_service.py",
  "services/agent-runtime/app/application/platform_operation_service.py",
  "services/agent-runtime/app/tools/registry.py",
  "services/agent-runtime/app/tools/sql_tool.py",
  "services/agent-runtime/app/tools/metric_tool.py",
  "services/agent-runtime/app/tools/rag_tool.py",
  "services/agent-runtime/app/tools/memory_tool.py",
  "services/agent-runtime/app/tools/report_tool.py",
  "services/agent-runtime/app/tools/mcp_adapter.py",
  "services/agent-runtime/app/model_gateway/gateway.py",
  "services/agent-runtime/app/model_gateway/routing.py",
  "services/agent-runtime/app/model_gateway/cost.py",
  "services/agent-runtime/app/model_gateway/errors.py",
  "services/agent-runtime/app/memory/user_memory.py",
  "services/agent-runtime/app/memory/workspace_memory.py",
  "services/agent-runtime/app/memory/analysis_memory.py",
  "services/agent-runtime/app/memory/decision_memory.py",
  "services/agent-runtime/app/evaluation/regression.py",
  "services/agent-runtime/app/governance/policy_engine.py",
  "services/agent-runtime/app/governance/sql_guard.py",
  "services/agent-runtime/app/governance/tool_permission.py",
  "services/agent-runtime/app/governance/data_access.py",
  "services/agent-runtime/app/governance/audit.py",
  "services/agent-runtime/app/observability/trace.py",
  "services/agent-runtime/app/observability/metrics.py",
  "services/agent-runtime/app/observability/logging.py",
  "services/agent-runtime/app/observability/cost.py"
];
const domainDirs = [
  "workspace",
  "iam",
  "data_knowledge",
  "metrics",
  "analysis",
  "memory",
  "feedback",
  "evaluation",
  "model_tools",
  "governance",
  "observability",
  "reports",
  "dashboard",
  "platform_operations"
];
const infrastructureDirs = [
  "db",
  "repositories",
  "vector_store",
  "cache",
  "queue",
  "scheduler",
  "object_storage",
  "secrets",
  "external_clients",
  "migrations",
  "seed",
  "backup",
  "restore",
  "notifications",
  "data_quality",
  "quota",
  "data_lifecycle"
];
const testDirs = ["unit", "contract", "integration", "smoke", "failure_simulation"];

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "docs/architecture.md",
  "docs/contracts.md",
  "docs/deployment.md",
  "services/agent-runtime/pyproject.toml",
  "packages/contracts/package.json",
  "packages/contracts/schemas",
  "packages/contracts/openapi/agent-runtime.openapi.yaml",
  "packages/contracts/generated/typescript",
  "packages/contracts/generated/python",
  "services/agent-runtime/app/api/routes",
  "services/agent-runtime/app/runtime/nodes",
  "services/agent-runtime/app/runtime/edges",
  "services/agent-runtime/app/runtime/checkpoints",
  "services/agent-runtime/app/model_gateway/providers",
  "services/agent-runtime/app/schemas/requests",
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
  ...appSections.map((section) => `apps/web/src/app/${section}`),
  ...pages.map((page) => `apps/web/src/pages/${page}`),
  ...features.flatMap((feature) =>
    featureLayers.map((layer) => `apps/web/src/features/${feature}/${layer}`)
  ),
  ...sharedLayers.map((layer) => `apps/web/src/shared/${layer}`),
  ...contractSchemas.map((schema) => `packages/contracts/schemas/${schema}.schema.json`),
  ...agents.map((agent) => `services/agent-runtime/app/agents/${agent}`),
  ...domainDirs.map((dir) => `services/agent-runtime/app/domain/${dir}`),
  ...backendFiles,
  ...infrastructureDirs.map((dir) => `services/agent-runtime/app/infrastructure/${dir}`),
  ...["requests", "responses", "dto"].map((dir) => `services/agent-runtime/app/schemas/${dir}`),
  ...testDirs.map((dir) => `services/agent-runtime/tests/${dir}`)
);

const missingPaths = requiredPaths.filter((path) => !existsSync(path));

if (missingPaths.length > 0) {
  console.error("Missing required project structure:");
  for (const path of missingPaths) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log("Structure guard passed.");
