import { existsSync } from "node:fs";

const appSections = ["router", "providers", "layout", "theme"];
const pages = [
  "dashboard",
  "analysis",
  "reports",
  "memory",
  "feedback",
  "evaluation",
  "governance",
  "observability",
  "settings"
];
const features = [
  "workspace",
  "data-knowledge",
  "metrics",
  "agent-analysis",
  "memory",
  "feedback",
  "evaluation",
  "model-tools",
  "governance",
  "observability",
  "reports"
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
  "analysis-run",
  "run-event",
  "tool-call",
  "model-call",
  "memory-item",
  "feedback",
  "evaluation-run",
  "bad-case",
  "source-evidence",
  "report",
  "decision",
  "audit-log"
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
  "data_quality"
];
const testDirs = ["unit", "contract", "integration", "smoke", "failure_simulation"];

const requiredPaths = [
  "AGENTS.md",
  "README.md",
  "docs/architecture.md",
  "docs/contracts.md",
  "docs/deployment.md",
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
  "services/agent-runtime/app/tests/smoke",
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
  ...backendFiles,
  ...infrastructureDirs.map((dir) => `services/agent-runtime/app/infrastructure/${dir}`),
  ...["requests", "responses", "dto"].map((dir) => `services/agent-runtime/app/schemas/${dir}`),
  ...testDirs.map((dir) => `services/agent-runtime/app/tests/${dir}`)
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
