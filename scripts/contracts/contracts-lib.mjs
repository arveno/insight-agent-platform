import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);

export const repoRoot = resolve(dirname(currentFile), "..", "..");
export const schemasRoot = resolve(repoRoot, "packages/contracts/schemas");
export const openApiPath = resolve(
  repoRoot,
  "packages/contracts/openapi/agent-runtime.openapi.yaml"
);
export const examplesRoot = resolve(repoRoot, "packages/contracts/examples");
export const generatedTypeScriptPath = resolve(
  repoRoot,
  "packages/contracts/generated/typescript/index.ts"
);
export const generatedPythonPath = resolve(
  repoRoot,
  "packages/contracts/generated/python/insight_agent_contracts.py"
);
export const contractsDocsPath = resolve(repoRoot, "docs/contracts.md");

export const analysisRunStatuses = [
  "created",
  "validating",
  "rejected",
  "queued",
  "running",
  "waiting",
  "cancelling",
  "cancelled",
  "failed",
  "completed",
  "expired"
];

export const analysisRunPhases = [
  "intake",
  "preflight",
  "governance",
  "context_binding",
  "planning",
  "approval",
  "queueing",
  "execution",
  "tool_execution",
  "evidence_binding",
  "synthesis",
  "verification",
  "delivery",
  "post_run"
];

export const analysisRunOutcomes = [
  "success",
  "partial_success",
  "policy_rejected",
  "user_cancelled",
  "timeout",
  "system_failure",
  "tool_failure",
  "model_failure",
  "verification_failure"
];

export const analysisRunWaitingFors = [
  "approval",
  "user_input",
  "tool_callback",
  "external_dependency",
  "rate_limit",
  "quota_reset",
  "scheduled_resume"
];

export const runEventStatuses = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "skipped",
  "cancelled"
];

export const conversationStatuses = ["active", "archived", "closed"];

export const messageRoles = ["system", "user", "assistant", "tool"];

export const messageStatuses = ["created", "streaming", "completed", "failed", "cancelled"];

export const messageStreamEventTypes = [
  "stream.started",
  "stream.delta",
  "stream.completed",
  "stream.failed",
  "stream.cancelled"
];

export const messageStreamStatuses = [
  "created",
  "streaming",
  "completed",
  "failed",
  "cancelled"
];

export const runEventTypes = [
  "run.created",
  "run.validating",
  "run.rejected",
  "run.queued",
  "run.started",
  "run.waiting",
  "run.cancel_requested",
  "run.cancelling",
  "run.cancelled",
  "run.failed",
  "run.completed",
  "run.expired",
  "validation.started",
  "validation.passed",
  "validation.rejected",
  "policy.check_started",
  "policy.decision_recorded",
  "context.bound",
  "plan.created",
  "approval.requested",
  "approval.granted",
  "approval.denied",
  "approval.expired",
  "worker.lease_acquired",
  "worker.heartbeat",
  "worker.failed",
  "worker.lost",
  "worker.lease_released",
  "execution_attempt.created",
  "execution_attempt.lost",
  "model_call.started",
  "model_call.completed",
  "model_call.failed",
  "tool_call.requested",
  "tool_call.policy_checked",
  "tool_call.started",
  "tool_call.completed",
  "tool_call.failed",
  "evidence.retrieved",
  "evidence.bound",
  "synthesis.started",
  "verification.started",
  "verification.passed",
  "verification.failed",
  "delivery.started",
  "artifact.persisted",
  "feedback.received",
  "evaluation.started",
  "evaluation.completed",
  "error.recorded"
];

export const executionAttemptStatuses = [
  "leased",
  "running",
  "lost",
  "released",
  "failed",
  "completed"
];

export const approvalStatuses = [
  "requested",
  "granted",
  "denied",
  "expired",
  "cancelled",
  "superseded"
];

export const decisionStatuses = [
  "proposed",
  "accepted",
  "rejected",
  "in_progress",
  "completed"
];

export const formalRuntimeEnumDocs = [
  { heading: "AnalysisRunStatus", values: analysisRunStatuses },
  { heading: "AnalysisRunPhase", values: analysisRunPhases },
  { heading: "AnalysisRunOutcome", values: analysisRunOutcomes },
  { heading: "AnalysisRunWaitingFor", values: analysisRunWaitingFors },
  { heading: "ConversationStatus", values: conversationStatuses },
  { heading: "MessageRole", values: messageRoles },
  { heading: "MessageStatus", values: messageStatuses },
  { heading: "MessageStreamEventType", values: messageStreamEventTypes },
  { heading: "MessageStreamStatus", values: messageStreamStatuses },
  { heading: "RunEventStatus", values: runEventStatuses },
  { heading: "RunEventType", values: runEventTypes },
  { heading: "ExecutionAttemptStatus", values: executionAttemptStatuses },
  { heading: "ApprovalStatus", values: approvalStatuses },
  { heading: "DecisionStatus", values: decisionStatuses }
];

export const runtimeSchemaPaths = [
  "analysis/analysis-task-context-pack.schema.json",
  "analysis/analysis-task.schema.json",
  "analysis/analysis-run.schema.json",
  "analysis/conversation.schema.json",
  "analysis/message.schema.json",
  "analysis/message-stream.schema.json",
  "analysis/run-event.schema.json",
  "analysis/tool-call.schema.json",
  "analysis/model-call.schema.json",
  "analysis/source-evidence.schema.json",
  "analysis/execution-attempt.schema.json",
  "analysis/approval-request.schema.json",
  "reports/report.schema.json",
  "reports/report-section.schema.json",
  "reports/decision.schema.json",
  "reports/action-suggestion.schema.json",
  "feedback/feedback.schema.json",
  "evaluation/evaluation-run.schema.json",
  "evaluation/evaluation-score.schema.json",
  "evaluation/bad-case.schema.json"
];

export const requiredFieldsBySchema = {
  "workspace/user.schema.json": ["userId", "email", "displayName", "createdAt", "updatedAt"],
  "workspace/workspace.schema.json": ["workspaceId", "name", "createdAt", "updatedAt"],
  "workspace/role.schema.json": ["role"],
  "workspace/workspace-membership.schema.json": [
    "membershipId",
    "userId",
    "workspaceId",
    "role",
    "createdAt",
    "updatedAt"
  ],
  "workspace/workspace-list-item.schema.json": ["membership", "workspace"],
  "workspace/auth-session.schema.json": [
    "authSessionId",
    "userId",
    "currentWorkspaceId",
    "expiresAt",
    "createdAt",
    "updatedAt"
  ],
  "workspace/current-workspace-context.schema.json": [
    "membershipId",
    "userId",
    "workspaceId",
    "role"
  ],
  "workspace/login-request.schema.json": ["email", "password"],
  "workspace/login-response.schema.json": [
    "user",
    "authSession",
    "currentWorkspaceContext",
    "memberships"
  ],
  "workspace/me-response.schema.json": ["user", "authSession", "currentWorkspaceContext"],
  "workspace/workspace-list-response.schema.json": ["items"],
  "workspace/select-workspace-request.schema.json": ["workspaceId"],
  "workspace/select-workspace-response.schema.json": ["authSession", "currentWorkspaceContext"],
  "workspace/logout-response.schema.json": ["success"],
  "analysis/analysis-task-context-pack.schema.json": [
    "version",
    "suggestedPrompt",
    "traceability",
    "capturedAt",
    "root"
  ],
  "analysis/analysis-task.schema.json": [
    "analysisTaskId",
    "conversationId",
    "workspaceId",
    "userId",
    "businessDomainId",
    "question",
    "contextPack",
    "createdAt",
    "updatedAt"
  ],
  "analysis/submit-analysis-draft-request.schema.json": [
    "businessDomainId",
    "question",
    "contextPack"
  ],
  "analysis/submit-analysis-draft-response.schema.json": [
    "conversation",
    "analysisTask",
    "analysisRun",
    "userMessage"
  ],
  "analysis/analysis-run.schema.json": [
    "runId",
    "workspaceId",
    "userId",
    "analysisTaskId",
    "status",
    "phase",
    "createdAt"
  ],
  "analysis/conversation.schema.json": [
    "conversationId",
    "workspaceId",
    "userId",
    "currentRunId",
    "title",
    "status",
    "createdAt",
    "updatedAt"
  ],
  "analysis/message.schema.json": [
    "messageId",
    "conversationId",
    "analysisTaskId",
    "turnId",
    "runId",
    "role",
    "content",
    "status",
    "sourceEvidenceIds",
    "toolCallIds",
    "reportId",
    "createdAt",
    "completedAt"
  ],
  "analysis/message-stream.schema.json": [
    "messageStreamId",
    "conversationId",
    "messageId",
    "runId",
    "sequence",
    "eventType",
    "delta",
    "status",
    "occurredAt",
    "errorCode",
    "errorMessage"
  ],
  "analysis/run-event.schema.json": [
    "eventId",
    "runId",
    "eventType",
    "status",
    "phase",
    "sequence",
    "actor",
    "occurredAt",
    "summary"
  ],
  "analysis/tool-call.schema.json": [
    "toolCallId",
    "runId",
    "toolName",
    "input",
    "status",
    "riskLevel",
    "permission",
    "startedAt"
  ],
  "analysis/model-call.schema.json": [
    "modelCallId",
    "runId",
    "provider",
    "modelId",
    "promptVersionId",
    "inputTokens",
    "outputTokens",
    "cost",
    "latencyMs",
    "status",
    "startedAt"
  ],
  "analysis/source-evidence.schema.json": [
    "sourceEvidenceId",
    "runId",
    "sourceType",
    "sourceId",
    "title",
    "snippet",
    "confidence",
    "createdAt"
  ],
  "analysis/execution-attempt.schema.json": [
    "attemptId",
    "runId",
    "attemptNumber",
    "workerId",
    "leaseId",
    "status",
    "leaseAcquiredAt",
    "leaseExpiresAt"
  ],
  "analysis/approval-request.schema.json": [
    "approvalId",
    "runId",
    "requestedAction",
    "riskLevel",
    "status",
    "requestedAt",
    "expiresAt"
  ],
  "reports/report.schema.json": [
    "reportId",
    "runId",
    "workspaceId",
    "title",
    "summary",
    "sections",
    "createdAt"
  ],
  "reports/report-section.schema.json": [
    "reportSectionId",
    "reportId",
    "title",
    "content",
    "createdAt"
  ],
  "reports/decision.schema.json": [
    "decisionId",
    "workspaceId",
    "runId",
    "reportId",
    "title",
    "status",
    "createdAt"
  ],
  "reports/action-suggestion.schema.json": [
    "actionSuggestionId",
    "decisionId",
    "summary",
    "createdAt"
  ],
  "feedback/feedback.schema.json": [
    "feedbackId",
    "workspaceId",
    "userId",
    "runId",
    "reportId",
    "feedbackType",
    "createdAt"
  ],
  "evaluation/evaluation-run.schema.json": [
    "evaluationRunId",
    "workspaceId",
    "runId",
    "datasetId",
    "status",
    "createdAt"
  ],
  "evaluation/evaluation-score.schema.json": [
    "evaluationScoreId",
    "evaluationRunId",
    "score",
    "createdAt"
  ],
  "evaluation/bad-case.schema.json": [
    "badCaseId",
    "workspaceId",
    "runId",
    "failureType",
    "failureReason",
    "expectedBehavior",
    "createdAt"
  ]
};

export const minimumOpenApiPaths = [
  "/health",
  "/analysis-tasks",
  "/analysis-tasks/submit",
  "/conversations",
  "/analysis-runs",
  "/analysis-runs/{runId}",
  "/analysis-runs/{runId}/conversation",
  "/conversations/{conversationId}",
  "/conversations/{conversationId}/messages",
  "/conversations/{conversationId}/messages/{messageId}",
  "/conversations/{conversationId}/messages/{messageId}/stream",
  "/analysis-runs/{runId}/events",
  "/analysis-runs/{runId}/tool-calls",
  "/analysis-runs/{runId}/model-calls",
  "/analysis-runs/{runId}/source-evidence",
  "/analysis-runs/{runId}/reports",
  "/analysis-runs/{runId}/execution-attempts",
  "/analysis-runs/{runId}/approvals",
  "/analysis-runs/{runId}/cancel",
  "/analysis-runs/{runId}/retry",
  "/analysis-runs/{runId}/approvals/{approvalId}/decision"
];

const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

function walkDirectory(dirPath) {
  return readdirSync(dirPath, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = resolve(dirPath, entry.name);

      if (entry.isDirectory()) {
        return walkDirectory(absolutePath);
      }

      return absolutePath.endsWith(".json") ? [absolutePath] : [];
    })
    .sort();
}

export function collectSchemaFiles() {
  return walkDirectory(schemasRoot).map((absolutePath) =>
    relative(schemasRoot, absolutePath).replaceAll("\\", "/")
  );
}

export function loadSchemas() {
  return collectSchemaFiles().map((relativePath) => {
    const absolutePath = resolve(schemasRoot, relativePath);

    return {
      absolutePath,
      relativePath,
      schema: JSON.parse(readFileSync(absolutePath, "utf8"))
    };
  });
}

export function createSchemaIndex(schemaEntries) {
  const byPath = new Map();
  const byTitle = new Map();

  for (const entry of schemaEntries) {
    byPath.set(entry.relativePath, entry);
    byTitle.set(entry.schema.title, entry);
  }

  return { byPath, byTitle };
}

function resolveRefPath(ref, currentRelativePath) {
  if (!ref.startsWith(".")) {
    throw new Error(`Unsupported external schema ref: ${ref}`);
  }

  return relative(
    schemasRoot,
    resolve(dirname(resolve(schemasRoot, currentRelativePath)), ref)
  ).replaceAll("\\", "/");
}

export function resolveSchemaRef(ref, currentRelativePath, schemaIndex) {
  if (ref.startsWith("#/")) {
    throw new Error(`Local refs are not supported by the contracts generator: ${ref}`);
  }

  const referencedPath = resolveRefPath(ref, currentRelativePath);
  const referencedSchema = schemaIndex.byPath.get(referencedPath);

  if (!referencedSchema) {
    throw new Error(
      `Unable to resolve schema ref ${ref} from ${currentRelativePath}; expected ${referencedPath}`
    );
  }

  return referencedSchema;
}

function quoteLiteral(value) {
  return JSON.stringify(value);
}

function renderInlineTsObject(schemaFragment, context) {
  const properties = Object.entries(schemaFragment.properties ?? {});
  const required = new Set(schemaFragment.required ?? []);

  if (properties.length === 0) {
    return schemaFragment.additionalProperties === false
      ? "Record<string, never>"
      : "Record<string, unknown>";
  }

  const members = properties.map(([propertyName, propertySchema]) => {
    const key = identifierPattern.test(propertyName)
      ? propertyName
      : JSON.stringify(propertyName);
    const optionalMarker = required.has(propertyName) ? "" : "?";

    return `${key}${optionalMarker}: ${renderTypeScriptType(propertySchema, context)};`;
  });

  return `{ ${members.join(" ")} }`;
}

export function renderTypeScriptType(schemaFragment, context) {
  if (schemaFragment.$ref) {
    return resolveSchemaRef(schemaFragment.$ref, context.relativePath, context.schemaIndex).schema
      .title;
  }

  if (schemaFragment.anyOf) {
    return schemaFragment.anyOf
      .map((member) => renderTypeScriptType(member, context))
      .join(" | ");
  }

  if (schemaFragment.enum) {
    return schemaFragment.enum.map(quoteLiteral).join(" | ");
  }

  if (Array.isArray(schemaFragment.type)) {
    return [...new Set(schemaFragment.type)].map((typeName) =>
      renderTypeScriptType({ ...schemaFragment, type: typeName, enum: undefined }, context)
    ).join(" | ");
  }

  switch (schemaFragment.type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "array":
      return `Array<${renderTypeScriptType(schemaFragment.items ?? {}, context)}>`;
    case "object":
      return renderInlineTsObject(schemaFragment, context);
    default:
      return "unknown";
  }
}

function renderInlinePythonObject(schemaFragment) {
  if (schemaFragment.properties && Object.keys(schemaFragment.properties).length > 0) {
    return "dict[str, Any]";
  }

  return schemaFragment.additionalProperties === false ? "dict[str, Never]" : "dict[str, Any]";
}

export function renderPythonType(schemaFragment, context) {
  if (schemaFragment.$ref) {
    return resolveSchemaRef(schemaFragment.$ref, context.relativePath, context.schemaIndex).schema
      .title;
  }

  if (schemaFragment.anyOf) {
    return schemaFragment.anyOf.map((member) => renderPythonType(member, context)).join(" | ");
  }

  if (schemaFragment.enum) {
    return `Literal[${schemaFragment.enum.map(quoteLiteral).join(", ")}]`;
  }

  if (Array.isArray(schemaFragment.type)) {
    const renderedTypes = [...new Set(schemaFragment.type)].map((typeName) =>
      renderPythonType({ ...schemaFragment, type: typeName, enum: undefined }, context)
    );

    return renderedTypes.join(" | ");
  }

  switch (schemaFragment.type) {
    case "string":
      return "str";
    case "integer":
      return "int";
    case "number":
      return "float";
    case "boolean":
      return "bool";
    case "null":
      return "None";
    case "array":
      return `list[${renderPythonType(schemaFragment.items ?? {}, context)}]`;
    case "object":
      return renderInlinePythonObject(schemaFragment);
    default:
      return "Any";
  }
}

export function renderTypeScriptTypes(schemaEntries) {
  const schemaIndex = createSchemaIndex(schemaEntries);
  const header = [
    "/*",
    " * This file is generated by scripts/contracts/generate-contract-types.mjs.",
    " * Do not edit this file directly.",
    " */",
    "",
    "export type JsonObject = Record<string, unknown>;",
    ""
  ];

  const blocks = schemaEntries.map(({ relativePath, schema }) => {
    const required = new Set(schema.required ?? []);
    const lines = [
      `/** Generated from packages/contracts/schemas/${relativePath} */`,
      `export interface ${schema.title} {`
    ];

    for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
      const key = identifierPattern.test(propertyName)
        ? propertyName
        : JSON.stringify(propertyName);
      const optionalMarker = required.has(propertyName) ? "" : "?";
      lines.push(
        `  ${key}${optionalMarker}: ${renderTypeScriptType(propertySchema, {
          relativePath,
          schemaIndex
        })};`
      );
    }

    lines.push("}");

    return lines.join("\n");
  });

  return `${header.join("\n")}${blocks.join("\n\n")}\n`;
}

export function renderPythonTypes(schemaEntries) {
  const schemaIndex = createSchemaIndex(schemaEntries);
  const header = [
    '"""',
    "Generated by scripts/contracts/generate-contract-types.mjs.",
    "Do not edit this file directly.",
    '"""',
    "",
    "from __future__ import annotations",
    "",
    "from typing import Any, Literal, Never, NotRequired, TypedDict",
    ""
  ];

  const blocks = schemaEntries.map(({ relativePath, schema }) => {
    const required = new Set(schema.required ?? []);
    const lines = [
      `# Generated from packages/contracts/schemas/${relativePath}`,
      `class ${schema.title}(TypedDict):`
    ];

    const properties = Object.entries(schema.properties ?? {});

    if (properties.length === 0) {
      lines.push("    pass");
      return lines.join("\n");
    }

    for (const [propertyName, propertySchema] of properties) {
      const renderedType = renderPythonType(propertySchema, {
        relativePath,
        schemaIndex
      });
      const prefix = required.has(propertyName) ? "" : "NotRequired[";
      const suffix = required.has(propertyName) ? "" : "]";

      lines.push(`    ${propertyName}: ${prefix}${renderedType}${suffix}`);
    }

    return lines.join("\n");
  });

  const exportedTypes = schemaEntries.map(({ schema }) => JSON.stringify(schema.title)).join(", ");

  return `${header.join("\n")}${blocks.join("\n\n")}\n\n__all__ = [${exportedTypes}]\n`;
}

export function generateArtifacts() {
  const schemaEntries = loadSchemas();

  return {
    schemaEntries,
    typeScript: renderTypeScriptTypes(schemaEntries),
    python: renderPythonTypes(schemaEntries)
  };
}

export function writeGeneratedArtifacts() {
  const { typeScript, python } = generateArtifacts();

  mkdirSync(dirname(generatedTypeScriptPath), { recursive: true });
  mkdirSync(dirname(generatedPythonPath), { recursive: true });

  writeFileSync(generatedTypeScriptPath, typeScript);
  writeFileSync(generatedPythonPath, python);
}

export function readContractsDocs() {
  return readFileSync(contractsDocsPath, "utf8");
}

export function readOpenApiSource() {
  return readFileSync(openApiPath, "utf8");
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateNumberConstraints(value, schemaFragment, path, errors) {
  if (typeof schemaFragment.minimum === "number" && value < schemaFragment.minimum) {
    errors.push(`${path} must be >= ${schemaFragment.minimum}.`);
  }

  if (typeof schemaFragment.maximum === "number" && value > schemaFragment.maximum) {
    errors.push(`${path} must be <= ${schemaFragment.maximum}.`);
  }
}

function validateSchemaFragment(value, schemaFragment, context, path, errors) {
  if (schemaFragment.$ref) {
    const resolvedSchema = resolveSchemaRef(
      schemaFragment.$ref,
      context.relativePath,
      context.schemaIndex
    );
    validateSchemaFragment(
      value,
      resolvedSchema.schema,
      { relativePath: resolvedSchema.relativePath, schemaIndex: context.schemaIndex },
      path,
      errors
    );
    return;
  }

  if (schemaFragment.anyOf) {
    const memberErrors = schemaFragment.anyOf.map((member) => {
      const branchErrors = [];
      validateSchemaFragment(value, member, context, path, branchErrors);
      return branchErrors;
    });

    if (!memberErrors.some((branchErrors) => branchErrors.length === 0)) {
      errors.push(
        `${path} does not satisfy any allowed schema shape: ${memberErrors
          .flat()
          .join(" | ")}`
      );
    }

    return;
  }

  if (schemaFragment.enum && !schemaFragment.enum.includes(value)) {
    errors.push(`${path} must be one of ${schemaFragment.enum.join(", ")}.`);
    return;
  }

  if (Array.isArray(schemaFragment.type)) {
    const branchErrors = schemaFragment.type.map((typeName) => {
      const nextErrors = [];
      validateSchemaFragment(
        value,
        { ...schemaFragment, type: typeName, enum: undefined },
        context,
        path,
        nextErrors
      );
      return nextErrors;
    });

    if (!branchErrors.some((nextErrors) => nextErrors.length === 0)) {
      errors.push(`${path} type mismatch: ${branchErrors.flat().join(" | ")}`);
    }

    return;
  }

  switch (schemaFragment.type) {
    case "string":
      if (typeof value !== "string") {
        errors.push(`${path} must be a string.`);
        return;
      }

      if (schemaFragment.format === "date-time" && Number.isNaN(Date.parse(value))) {
        errors.push(`${path} must be a valid date-time string.`);
      }
      return;
    case "integer":
      if (!Number.isInteger(value)) {
        errors.push(`${path} must be an integer.`);
        return;
      }

      validateNumberConstraints(value, schemaFragment, path, errors);
      return;
    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push(`${path} must be a number.`);
        return;
      }

      validateNumberConstraints(value, schemaFragment, path, errors);
      return;
    case "boolean":
      if (typeof value !== "boolean") {
        errors.push(`${path} must be a boolean.`);
      }
      return;
    case "null":
      if (value !== null) {
        errors.push(`${path} must be null.`);
      }
      return;
    case "array":
      if (!Array.isArray(value)) {
        errors.push(`${path} must be an array.`);
        return;
      }

      value.forEach((item, index) => {
        validateSchemaFragment(item, schemaFragment.items ?? {}, context, `${path}[${index}]`, errors);
      });
      return;
    case "object":
      if (!isPlainObject(value)) {
        errors.push(`${path} must be an object.`);
        return;
      }

      for (const requiredField of schemaFragment.required ?? []) {
        if (!(requiredField in value)) {
          errors.push(`${path}.${requiredField} is required.`);
        }
      }

      const properties = schemaFragment.properties ?? {};

      if (schemaFragment.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!(key in properties)) {
            errors.push(`${path}.${key} is not allowed.`);
          }
        }
      }

      for (const [propertyName, propertySchema] of Object.entries(properties)) {
        if (propertyName in value) {
          validateSchemaFragment(
            value[propertyName],
            propertySchema,
            context,
            `${path}.${propertyName}`,
            errors
          );
        }
      }
      return;
    default:
      return;
  }
}

export function validateExampleAgainstSchema(value, schemaTitle, schemaEntries) {
  const schemaIndex = createSchemaIndex(schemaEntries);
  const schemaEntry = schemaIndex.byTitle.get(schemaTitle);

  if (!schemaEntry) {
    throw new Error(`Unable to locate schema titled ${schemaTitle}.`);
  }

  const errors = [];
  validateSchemaFragment(
    value,
    schemaEntry.schema,
    { relativePath: schemaEntry.relativePath, schemaIndex },
    schemaTitle,
    errors
  );

  return errors;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function readDocsEnumBlock(source, heading) {
  const pattern = new RegExp(
    `### ${escapeRegExp(heading)}\\n\\n\`\`\`text\\n([\\s\\S]*?)\\n\`\`\``
  );
  const match = source.match(pattern);

  if (!match) {
    throw new Error(`Unable to locate enum block ${heading} in ${contractsDocsPath}.`);
  }

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
