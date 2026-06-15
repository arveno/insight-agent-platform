#!/usr/bin/env bash
set -Eeuo pipefail

readonly BASE_URL="${IAP_RUNTIME_BASE_URL:-${1:-}}"
readonly API_BASE_PATH="${IAP_RUNTIME_API_BASE_PATH:-}"
readonly LOGIN_EMAIL="${IAP_RUNTIME_LOGIN_EMAIL:-zoe@northstar.example.com}"
readonly LOGIN_PASSWORD="${IAP_RUNTIME_LOGIN_PASSWORD:-zoe-password}"
readonly BUSINESS_DOMAIN_ID="${IAP_RUNTIME_BUSINESS_DOMAIN_ID:-business-domain-revenue-quality}"
readonly QUESTION="${IAP_RUNTIME_QUESTION:-解释华东区域收入增速放缓的主要原因，并给出下一步建议。}"

cookie_jar=""

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

cleanup() {
  if [[ -n "${cookie_jar}" && -f "${cookie_jar}" ]]; then
    rm -f "${cookie_jar}"
  fi
}

json_field() {
  local file_path="$1"
  local field_name="$2"
  python3 - "$file_path" "$field_name" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    payload = json.load(handle)

value = payload
for segment in sys.argv[2].split("."):
    value = value[segment]

if value is None:
    print("null")
elif isinstance(value, list):
    print(",".join(str(item) for item in value))
else:
    print(value)
PY
}

json_list_length() {
  local file_path="$1"
  local field_name="$2"
  python3 - "$file_path" "$field_name" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    payload = json.load(handle)

value = payload
for segment in sys.argv[2].split("."):
    value = value[segment]

if not isinstance(value, list):
    raise SystemExit(f"{sys.argv[2]} is not a list")

print(len(value))
PY
}

api_url() {
  local path="$1"
  printf '%s%s%s\n' "${BASE_URL%/}" "${API_BASE_PATH}" "${path}"
}

trap cleanup EXIT

[[ -n "${BASE_URL}" ]] || die "Missing runtime base URL. Set IAP_RUNTIME_BASE_URL or pass the base URL as the first argument."
command -v curl >/dev/null 2>&1 || die "curl is required."
command -v python3 >/dev/null 2>&1 || die "python3 is required."

readonly TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/runtime-api-foundation.XXXXXX")"
trap 'cleanup; rm -rf "${TMP_DIR}"' EXIT

readonly LOGIN_RESPONSE="${TMP_DIR}/auth-login.json"
readonly SUBMIT_RESPONSE="${TMP_DIR}/submit-analysis-draft.json"
readonly ANALYSIS_TASK_RESPONSE="${TMP_DIR}/analysis-task.json"
readonly CONVERSATION_RESPONSE="${TMP_DIR}/conversation.json"
readonly MESSAGES_RESPONSE="${TMP_DIR}/messages.json"
readonly ANALYSIS_RUN_RESPONSE="${TMP_DIR}/analysis-run.json"
readonly RUN_EVENTS_RESPONSE="${TMP_DIR}/run-events.json"
readonly SOURCE_EVIDENCE_RESPONSE="${TMP_DIR}/source-evidence.json"
readonly REPORTS_RESPONSE="${TMP_DIR}/reports.json"
readonly DECISIONS_RESPONSE="${TMP_DIR}/decisions.json"
readonly TOOL_CALLS_RESPONSE="${TMP_DIR}/tool-calls.json"
readonly MODEL_CALLS_RESPONSE="${TMP_DIR}/model-calls.json"

cookie_jar="$(mktemp)"

printf 'POST %s\n' "$(api_url "/auth/login")"
curl -fsS \
  --cookie-jar "${cookie_jar}" \
  --header "Content-Type: application/json" \
  --data "{\"email\":\"${LOGIN_EMAIL}\",\"password\":\"${LOGIN_PASSWORD}\"}" \
  "$(api_url "/auth/login")" \
  >"${LOGIN_RESPONSE}"

JSON_PAYLOAD="$(cat "${LOGIN_RESPONSE}")" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["user"]["userId"] == "user-zoe", payload
assert payload["authSession"]["currentWorkspaceId"] == "workspace-northstar-retail-china", payload
PY

printf 'POST %s\n' "$(api_url "/analysis-tasks/submit")"
curl -fsS \
  --cookie "${cookie_jar}" \
  --header "Content-Type: application/json" \
  --data @- \
  "$(api_url "/analysis-tasks/submit")" \
  >"${SUBMIT_RESPONSE}" <<JSON
{
  "businessDomainId": "${BUSINESS_DOMAIN_ID}",
  "question": "${QUESTION}",
  "contextPack": {
    "version": 1,
    "suggestedPrompt": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "traceability": "direct_refs",
    "capturedAt": "2026-06-12T10:28:00+08:00",
    "root": {
      "nodeId": "inspector-node-task-context-root",
      "kind": "dashboardOverview",
      "role": "inputContext",
      "owner": {
        "type": "analysisTask"
      },
      "title": "经营状态总览",
      "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
      "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
      "timeRange": {
        "key": "this_quarter",
        "label": "2026 Q2"
      },
      "capturedAt": "2026-06-12T10:28:00+08:00",
      "children": [
        {
          "nodeId": "context-metric-recognized-revenue",
          "kind": "metric",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "确认收入",
          "summary": "当前异常指标来源。",
          "sourceRef": {
            "type": "metric",
            "metricId": "metric-recognized-revenue"
          }
        },
        {
          "nodeId": "context-table-sales-order",
          "kind": "dataTable",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "销售订单表",
          "summary": "用于核对确认收入的订单明细。",
          "sourceRef": {
            "type": "dataTable",
            "tableId": "table-sales-order"
          }
        },
        {
          "nodeId": "context-table-refund-order",
          "kind": "dataTable",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "退款订单表",
          "summary": "用于核对退款与收入回吐影响。",
          "sourceRef": {
            "type": "dataTable",
            "tableId": "table-refund-order"
          }
        },
        {
          "nodeId": "context-knowledge-channel-weekly-17",
          "kind": "knowledgeDocument",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "渠道周报 Week 17",
          "summary": "补充华东渠道确认延迟背景。",
          "sourceRef": {
            "type": "knowledgeDocument",
            "knowledgeDocumentId": "knowledge-document-channel-weekly-17"
          }
        },
        {
          "nodeId": "context-knowledge-inventory-east-04",
          "kind": "knowledgeDocument",
          "role": "inputContext",
          "owner": {
            "type": "analysisTask"
          },
          "title": "华东库存说明 04",
          "summary": "补充促销库存与区域履约背景。",
          "sourceRef": {
            "type": "knowledgeDocument",
            "knowledgeDocumentId": "knowledge-document-inventory-east-04"
          }
        }
      ]
    }
  }
}
JSON

JSON_PAYLOAD="$(cat "${SUBMIT_RESPONSE}")" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
conversation = payload["conversation"]
analysis_task = payload["analysisTask"]
analysis_run = payload["analysisRun"]
user_message = payload["userMessage"]

assert conversation["conversationId"].startswith("conversation-"), payload
assert analysis_task["analysisTaskId"].startswith("analysis-task-"), payload
assert analysis_run["runId"].startswith("analysis-run-"), payload
assert user_message["messageId"].startswith("message-"), payload
assert analysis_run["status"] == "created", payload
assert analysis_run["phase"] == "intake", payload
assert analysis_run["completedAt"] is None, payload
assert user_message["role"] == "user", payload
assert user_message["reportId"] is None, payload
assert user_message["sourceEvidenceIds"] == [], payload
assert user_message["toolCallIds"] == [], payload
assert user_message["conversationId"] == conversation["conversationId"], payload
assert user_message["analysisTaskId"] == analysis_task["analysisTaskId"], payload
assert user_message["runId"] == analysis_run["runId"], payload
assert conversation["currentRunId"] == analysis_run["runId"], payload
assert analysis_task["conversationId"] == conversation["conversationId"], payload
assert analysis_task["contextPack"]["root"]["owner"]["analysisTaskId"] == analysis_task["analysisTaskId"], payload
PY

readonly CONVERSATION_ID="$(json_field "${SUBMIT_RESPONSE}" "conversation.conversationId")"
readonly ANALYSIS_TASK_ID="$(json_field "${SUBMIT_RESPONSE}" "analysisTask.analysisTaskId")"
readonly RUN_ID="$(json_field "${SUBMIT_RESPONSE}" "analysisRun.runId")"
readonly USER_MESSAGE_ID="$(json_field "${SUBMIT_RESPONSE}" "userMessage.messageId")"

printf 'GET %s\n' "$(api_url "/analysis-tasks/${ANALYSIS_TASK_ID}")"
curl -fsS \
  --cookie "${cookie_jar}" \
  "$(api_url "/analysis-tasks/${ANALYSIS_TASK_ID}")" \
  >"${ANALYSIS_TASK_RESPONSE}"

printf 'GET %s\n' "$(api_url "/conversations/${CONVERSATION_ID}")"
curl -fsS \
  --cookie "${cookie_jar}" \
  "$(api_url "/conversations/${CONVERSATION_ID}")" \
  >"${CONVERSATION_RESPONSE}"

printf 'GET %s\n' "$(api_url "/conversations/${CONVERSATION_ID}/messages")"
curl -fsS \
  --cookie "${cookie_jar}" \
  "$(api_url "/conversations/${CONVERSATION_ID}/messages")" \
  >"${MESSAGES_RESPONSE}"

printf 'GET %s\n' "$(api_url "/analysis-runs/${RUN_ID}")"
curl -fsS \
  --cookie "${cookie_jar}" \
  "$(api_url "/analysis-runs/${RUN_ID}")" \
  >"${ANALYSIS_RUN_RESPONSE}"

printf 'GET %s\n' "$(api_url "/analysis-runs/${RUN_ID}/events")"
curl -fsS \
  --cookie "${cookie_jar}" \
  "$(api_url "/analysis-runs/${RUN_ID}/events")" \
  >"${RUN_EVENTS_RESPONSE}"

for surface in source-evidence reports decisions tool-calls model-calls; do
  printf 'GET %s\n' "$(api_url "/analysis-runs/${RUN_ID}/${surface}")"
  curl -fsS \
    --cookie "${cookie_jar}" \
    "$(api_url "/analysis-runs/${RUN_ID}/${surface}")" \
    >"${TMP_DIR}/${surface}.json"
done

JSON_PAYLOAD="$(cat "${ANALYSIS_TASK_RESPONSE}")" EXPECTED_ANALYSIS_TASK_ID="${ANALYSIS_TASK_ID}" EXPECTED_CONVERSATION_ID="${CONVERSATION_ID}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["analysisTaskId"] == os.environ["EXPECTED_ANALYSIS_TASK_ID"], payload
assert payload["conversationId"] == os.environ["EXPECTED_CONVERSATION_ID"], payload
assert payload["contextPack"]["root"]["owner"]["analysisTaskId"] == payload["analysisTaskId"], payload
PY

JSON_PAYLOAD="$(cat "${CONVERSATION_RESPONSE}")" EXPECTED_RUN_ID="${RUN_ID}" EXPECTED_CONVERSATION_ID="${CONVERSATION_ID}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["conversationId"] == os.environ["EXPECTED_CONVERSATION_ID"], payload
assert payload["currentRunId"] == os.environ["EXPECTED_RUN_ID"], payload
PY

JSON_PAYLOAD="$(cat "${MESSAGES_RESPONSE}")" EXPECTED_MESSAGE_ID="${USER_MESSAGE_ID}" EXPECTED_RUN_ID="${RUN_ID}" EXPECTED_ANALYSIS_TASK_ID="${ANALYSIS_TASK_ID}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
items = payload["items"]
assert len(items) == 1, payload
message = items[0]
assert message["messageId"] == os.environ["EXPECTED_MESSAGE_ID"], payload
assert message["role"] == "user", payload
assert message["analysisTaskId"] == os.environ["EXPECTED_ANALYSIS_TASK_ID"], payload
assert message["runId"] == os.environ["EXPECTED_RUN_ID"], payload
assert message["reportId"] is None, payload
assert message["sourceEvidenceIds"] == [], payload
assert message["toolCallIds"] == [], payload
PY

JSON_PAYLOAD="$(cat "${ANALYSIS_RUN_RESPONSE}")" EXPECTED_RUN_ID="${RUN_ID}" EXPECTED_ANALYSIS_TASK_ID="${ANALYSIS_TASK_ID}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["runId"] == os.environ["EXPECTED_RUN_ID"], payload
assert payload["analysisTaskId"] == os.environ["EXPECTED_ANALYSIS_TASK_ID"], payload
assert payload["status"] == "created", payload
assert payload["phase"] == "intake", payload
assert payload["completedAt"] is None, payload
assert payload["outcome"] is None, payload
PY

JSON_PAYLOAD="$(cat "${RUN_EVENTS_RESPONSE}")" EXPECTED_RUN_ID="${RUN_ID}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
items = payload["items"]
assert len(items) == 1, payload
event = items[0]
assert event["runId"] == os.environ["EXPECTED_RUN_ID"], payload
assert event["eventType"] == "run.created", payload
assert event["status"] == "succeeded", payload
assert event["phase"] == "intake", payload
assert event["sequence"] == 0, payload
PY

for surface_file in \
  "${SOURCE_EVIDENCE_RESPONSE}" \
  "${REPORTS_RESPONSE}" \
  "${DECISIONS_RESPONSE}" \
  "${TOOL_CALLS_RESPONSE}" \
  "${MODEL_CALLS_RESPONSE}"; do
  JSON_PAYLOAD="$(cat "${surface_file}")" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["items"] == [], payload
PY
done

printf 'conversationId=%s\n' "${CONVERSATION_ID}"
printf 'analysisTaskId=%s\n' "${ANALYSIS_TASK_ID}"
printf 'runId=%s\n' "${RUN_ID}"
printf 'userMessageId=%s\n' "${USER_MESSAGE_ID}"
printf 'analysisRun.status=%s\n' "$(json_field "${ANALYSIS_RUN_RESPONSE}" "status")"
printf 'analysisRun.phase=%s\n' "$(json_field "${ANALYSIS_RUN_RESPONSE}" "phase")"
printf 'messages.count=%s\n' "$(json_list_length "${MESSAGES_RESPONSE}" "items")"
printf 'runEvents.count=%s\n' "$(json_list_length "${RUN_EVENTS_RESPONSE}" "items")"
printf 'sourceEvidence.count=%s\n' "$(json_list_length "${SOURCE_EVIDENCE_RESPONSE}" "items")"
printf 'reports.count=%s\n' "$(json_list_length "${REPORTS_RESPONSE}" "items")"
printf 'decisions.count=%s\n' "$(json_list_length "${DECISIONS_RESPONSE}" "items")"
printf 'toolCalls.count=%s\n' "$(json_list_length "${TOOL_CALLS_RESPONSE}" "items")"
printf 'modelCalls.count=%s\n' "$(json_list_length "${MODEL_CALLS_RESPONSE}" "items")"
