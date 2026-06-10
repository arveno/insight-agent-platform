import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import {
  analysisRunOutcomes,
  analysisRunPhases,
  analysisRunStatuses,
  analysisRunWaitingFors,
  approvalStatuses,
  conversationStatuses,
  contractsDocsPath,
  examplesRoot,
  executionAttemptStatuses,
  formalRuntimeEnumDocs,
  generateArtifacts,
  generatedPythonPath,
  generatedTypeScriptPath,
  messageRoles,
  messageStatuses,
  messageStreamEventTypes,
  messageStreamStatuses,
  minimumOpenApiPaths,
  openApiPath,
  readDocsEnumBlock,
  readContractsDocs,
  validateExampleAgainstSchema,
  requiredFieldsBySchema,
  runEventStatuses,
  runEventTypes
} from "./contracts-lib.mjs";

function fail(message) {
  throw new Error(message);
}

const { schemaEntries, typeScript, python } = generateArtifacts();
const schemaByPath = new Map(schemaEntries.map((entry) => [entry.relativePath, entry.schema]));
const schemaByTitle = new Map(schemaEntries.map((entry) => [entry.schema.title, entry.schema]));
const contractsDocs = readContractsDocs();
const openApiSource = readFileSync(openApiPath, "utf8");

for (const entry of schemaEntries) {
  const { relativePath, schema } = entry;

  if (!schema.$schema) {
    fail(`${relativePath} is missing $schema.`);
  }

  if (!schema.$id) {
    fail(`${relativePath} is missing $id.`);
  }

  if (!schema.title) {
    fail(`${relativePath} is missing title.`);
  }

  if (schema.type !== "object") {
    fail(`${relativePath} must declare type=object.`);
  }

  if (schema.additionalProperties !== false) {
    fail(`${relativePath} must declare additionalProperties=false at the top level.`);
  }
}

for (const [relativePath, requiredFields] of Object.entries(requiredFieldsBySchema)) {
  const schema = schemaByPath.get(relativePath);

  if (!schema) {
    fail(`Missing required runtime schema: ${relativePath}`);
  }

  if (!Array.isArray(schema.required) || schema.required.length === 0) {
    fail(`${relativePath} must define non-empty required fields.`);
  }

  for (const fieldName of requiredFields) {
    if (!schema.required.includes(fieldName)) {
      fail(`${relativePath} is missing required field ${fieldName}.`);
    }
  }
}

const analysisRunSchema = schemaByPath.get("analysis/analysis-run.schema.json");
const conversationSchema = schemaByPath.get("analysis/conversation.schema.json");
const messageSchema = schemaByPath.get("analysis/message.schema.json");
const messageStreamSchema = schemaByPath.get("analysis/message-stream.schema.json");

if (!analysisRunSchema) {
  fail("analysis/analysis-run.schema.json is missing.");
}

if (!conversationSchema || !messageSchema || !messageStreamSchema) {
  fail("Conversation, Message, or MessageStream schema is missing.");
}

if (
  JSON.stringify(analysisRunSchema.properties.status.enum) !== JSON.stringify(analysisRunStatuses)
) {
  fail("AnalysisRun.status enum does not match the formal AnalysisRunStatus list.");
}

if (
  JSON.stringify(analysisRunSchema.properties.phase.enum) !== JSON.stringify(analysisRunPhases)
) {
  fail("AnalysisRun.phase enum does not match the formal AnalysisRunPhase list.");
}

if (
  JSON.stringify(analysisRunSchema.properties.outcome.anyOf?.[0]?.enum ?? []) !==
  JSON.stringify(analysisRunOutcomes)
) {
  fail("AnalysisRun.outcome enum does not match the formal AnalysisRunOutcome list.");
}

if (
  JSON.stringify(analysisRunSchema.properties.waitingFor.anyOf?.[0]?.enum ?? []) !==
  JSON.stringify(analysisRunWaitingFors)
) {
  fail("AnalysisRun.waitingFor enum does not match the formal AnalysisRunWaitingFor list.");
}

if (
  JSON.stringify(conversationSchema.properties.status.enum) !== JSON.stringify(conversationStatuses)
) {
  fail("Conversation.status enum does not match the formal ConversationStatus list.");
}

if (JSON.stringify(messageSchema.properties.role.enum) !== JSON.stringify(messageRoles)) {
  fail("Message.role enum does not match the formal MessageRole list.");
}

if (JSON.stringify(messageSchema.properties.status.enum) !== JSON.stringify(messageStatuses)) {
  fail("Message.status enum does not match the formal MessageStatus list.");
}

if (
  JSON.stringify(messageStreamSchema.properties.eventType.enum) !==
  JSON.stringify(messageStreamEventTypes)
) {
  fail("MessageStream.eventType enum does not match the formal MessageStreamEventType list.");
}

if (
  JSON.stringify(messageStreamSchema.properties.status.enum) !==
  JSON.stringify(messageStreamStatuses)
) {
  fail("MessageStream.status enum does not match the formal MessageStreamStatus list.");
}

const runEventSchema = schemaByPath.get("analysis/run-event.schema.json");

if (!runEventSchema) {
  fail("analysis/run-event.schema.json is missing.");
}

if (JSON.stringify(runEventSchema.properties.status.enum) !== JSON.stringify(runEventStatuses)) {
  fail("RunEvent.status enum does not match the formal RunEventStatus list.");
}

if (JSON.stringify(runEventSchema.properties.eventType.enum) !== JSON.stringify(runEventTypes)) {
  fail("RunEvent.eventType enum does not match the formal RunEventType list.");
}

const toolCallSchema = schemaByPath.get("analysis/tool-call.schema.json");
const modelCallSchema = schemaByPath.get("analysis/model-call.schema.json");

if (!toolCallSchema || !modelCallSchema) {
  fail("ToolCall or ModelCall schema is missing.");
}

if (JSON.stringify(toolCallSchema.properties.status.enum) !== JSON.stringify(runEventStatuses)) {
  fail("ToolCall.status enum must reuse RunEventStatus including cancelled.");
}

if (JSON.stringify(modelCallSchema.properties.status.enum) !== JSON.stringify(runEventStatuses)) {
  fail("ModelCall.status enum must reuse RunEventStatus including cancelled.");
}

const executionAttemptSchema = schemaByPath.get("analysis/execution-attempt.schema.json");
const approvalRequestSchema = schemaByPath.get("analysis/approval-request.schema.json");

if (!executionAttemptSchema || !approvalRequestSchema) {
  fail("ExecutionAttempt or ApprovalRequest schema is missing.");
}

if (
  JSON.stringify(executionAttemptSchema.properties.status.enum) !==
  JSON.stringify(executionAttemptStatuses)
) {
  fail("ExecutionAttempt.status enum does not match the formal ExecutionAttemptStatus list.");
}

if (
  JSON.stringify(approvalRequestSchema.properties.status.enum) !==
  JSON.stringify(approvalStatuses)
) {
  fail("ApprovalRequest.status enum does not match the formal ApprovalStatus list.");
}

const contractsCoreObjectsMatch = contractsDocs.match(
  /核心对象包括：\n\n```text\n([\s\S]*?)\n```/
);

if (!contractsCoreObjectsMatch) {
  fail(`Unable to locate the core object block in ${contractsDocsPath}.`);
}

const contractsCoreObjects = new Set(
  contractsCoreObjectsMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
);

const nonCoreSchemaTitles = new Set(["AnalysisTaskContextPack"]);

for (const schema of schemaEntries.map((entry) => entry.schema)) {
  if (nonCoreSchemaTitles.has(schema.title)) {
    continue;
  }

  if (!contractsCoreObjects.has(schema.title)) {
    fail(`docs/contracts.md is missing core object ${schema.title}.`);
  }
}

const requiredCanonicalIds = [
  "conversationId",
  "messageId",
  "turnId",
  "messageStreamId",
  "evaluationScoreId",
  "attemptId",
  "approvalId"
];

for (const identifier of requiredCanonicalIds) {
  if (!contractsDocs.includes(identifier)) {
    fail(`docs/contracts.md is missing canonical ID ${identifier}.`);
  }
}

for (const requiredPath of minimumOpenApiPaths) {
  if (!openApiSource.includes(requiredPath)) {
    fail(`OpenAPI is missing required runtime path ${requiredPath}.`);
  }
}

if (!openApiSource.includes("text/event-stream")) {
  fail("OpenAPI must declare text/event-stream for the MessageStream live transport path.");
}

if (!openApiSource.includes("CreateConversationRequest")) {
  fail("OpenAPI must declare CreateConversationRequest.");
}

if (!openApiSource.includes("CreateAnalysisTaskRequest")) {
  fail("OpenAPI must declare CreateAnalysisTaskRequest.");
}

if (!openApiSource.includes("conversationId")) {
  fail("OpenAPI must keep conversationId bound in runtime request/response surfaces.");
}

for (const componentName of [
  "AnalysisRun",
  "Conversation",
  "Message",
  "MessageStream",
  "RunEvent",
  "ToolCall",
  "ModelCall",
  "SourceEvidence",
  "Report",
  "ExecutionAttempt",
  "ApprovalRequest"
]) {
  if (!openApiSource.includes(componentName)) {
    fail(`OpenAPI is missing schema component reference ${componentName}.`);
  }
}

const onDiskTypeScript = readFileSync(generatedTypeScriptPath, "utf8");
const onDiskPython = readFileSync(generatedPythonPath, "utf8");

if (onDiskTypeScript !== typeScript) {
  fail(
    "Generated TypeScript contracts are stale. Run node scripts/contracts/generate-contract-types.mjs."
  );
}

if (onDiskPython !== python) {
  fail("Generated Python contracts are stale. Run node scripts/contracts/generate-contract-types.mjs.");
}

if (analysisRunSchema.properties.status.enum.includes("waiting_approval")) {
  fail("AnalysisRun.status must not keep waiting_approval as a formal status.");
}

if (!schemaByTitle.has("ExecutionAttempt") || !schemaByTitle.has("ApprovalRequest")) {
  fail("ExecutionAttempt and ApprovalRequest must be present in the formal contracts set.");
}

for (const { heading, values } of formalRuntimeEnumDocs) {
  const docsValues = readDocsEnumBlock(contractsDocs, heading);

  if (JSON.stringify(docsValues) !== JSON.stringify(values)) {
    fail(
      `docs/contracts.md enum block ${heading} does not match formal runtime enum values in scripts/contracts/contracts-lib.mjs.`
    );
  }
}

function readExampleFile(fileName) {
  return JSON.parse(
    readFileSync(resolve(examplesRoot, "analysis-runtime", fileName), "utf8")
  );
}

for (const [fileName, schemaTitle] of [
  ["conversation.created.json", "Conversation"],
  ["analysis-run.created.json", "AnalysisRun"],
  ["message.user.json", "Message"],
  ["message.assistant.completed.json", "Message"]
]) {
  const example = readExampleFile(fileName);
  const errors = validateExampleAgainstSchema(example, schemaTitle, schemaEntries);

  if (errors.length > 0) {
    fail(`${fileName} is not aligned with schema ${schemaTitle}: ${errors.join(" ")}`);
  }
}

const runEventSequence = readExampleFile("run-event.sequence.json");
if (!Array.isArray(runEventSequence.items) || runEventSequence.items.length === 0) {
  fail("run-event.sequence.json must contain a non-empty items array.");
}

for (const [index, item] of runEventSequence.items.entries()) {
  const errors = validateExampleAgainstSchema(item, "RunEvent", schemaEntries);
  if (errors.length > 0) {
    fail(`run-event.sequence.json item ${index} is invalid: ${errors.join(" ")}`);
  }
}

const messageStreamSequence = readExampleFile("message-stream.sequence.json");
if (!Array.isArray(messageStreamSequence.items) || messageStreamSequence.items.length === 0) {
  fail("message-stream.sequence.json must contain a non-empty items array.");
}

for (const [index, item] of messageStreamSequence.items.entries()) {
  const errors = validateExampleAgainstSchema(item, "MessageStream", schemaEntries);
  if (errors.length > 0) {
    fail(`message-stream.sequence.json item ${index} is invalid: ${errors.join(" ")}`);
  }
}

const goldenPath = readExampleFile("golden-path.json");
const goldenPathSchemaPairs = [
  ["analysisTask", "AnalysisTask"],
  ["conversation", "Conversation"],
  ["analysisRun", "AnalysisRun"]
];

for (const [fieldName, schemaTitle] of goldenPathSchemaPairs) {
  const errors = validateExampleAgainstSchema(goldenPath[fieldName], schemaTitle, schemaEntries);
  if (errors.length > 0) {
    fail(`golden-path.json field ${fieldName} is invalid: ${errors.join(" ")}`);
  }
}

for (const [fieldName, schemaTitle] of [
  ["messages", "Message"],
  ["runEvents", "RunEvent"],
  ["messageStream", "MessageStream"],
  ["toolCalls", "ToolCall"],
  ["modelCalls", "ModelCall"],
  ["sourceEvidence", "SourceEvidence"],
  ["reports", "Report"],
  ["decisions", "Decision"],
  ["executionAttempts", "ExecutionAttempt"],
  ["approvals", "ApprovalRequest"]
]) {
  const values = goldenPath[fieldName];

  if (!Array.isArray(values)) {
    fail(`golden-path.json field ${fieldName} must be an array.`);
  }

  for (const [index, item] of values.entries()) {
    const errors = validateExampleAgainstSchema(item, schemaTitle, schemaEntries);
    if (errors.length > 0) {
      fail(`golden-path.json field ${fieldName}[${index}] is invalid: ${errors.join(" ")}`);
    }
  }
}

console.log("Contracts check passed.");
