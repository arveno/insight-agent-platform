#!/usr/bin/env bash
set -euo pipefail

readonly BASE_URL="${IAP_RUNTIME_BASE_URL:-${1:-}}"

die() {
  printf '%s\n' "$*" >&2
  exit 1
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

if [[ -z "${BASE_URL}" ]]; then
  die "Missing runtime base URL. Set IAP_RUNTIME_BASE_URL or pass the base URL as the first argument."
fi

readonly NORMALIZED_BASE_URL="${BASE_URL%/}"
readonly TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/runtime-api-foundation.XXXXXX")"
trap 'rm -rf "${TMP_DIR}"' EXIT

readonly ANALYSIS_TASK_RESPONSE="${TMP_DIR}/analysis-task.json"
readonly CONVERSATION_RESPONSE="${TMP_DIR}/conversation.json"
readonly ANALYSIS_RUN_RESPONSE="${TMP_DIR}/analysis-run.json"
readonly GET_RUN_RESPONSE="${TMP_DIR}/get-run.json"
readonly GET_RUN_CONVERSATION_RESPONSE="${TMP_DIR}/get-run-conversation.json"
readonly GET_CONVERSATION_RESPONSE="${TMP_DIR}/get-conversation.json"

printf 'POST %s/analysis-tasks\n' "${NORMALIZED_BASE_URL}"
curl -fsS \
  -X POST \
  -H 'Content-Type: application/json' \
  "${NORMALIZED_BASE_URL}/analysis-tasks" \
  -d '{
    "workspaceId": "workspace-northstar-retail-china",
    "userId": "user-zoe",
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": {
      "metricId": "metric-recognized-revenue",
      "timeRange": "2026 Q2",
      "threshold": "收入增速 < -2%",
      "trend": "华东区域收入增速低于阈值",
      "tableIds": ["table-sales-order", "table-refund-order"],
      "knowledgeDocumentIds": [
        "knowledge-document-channel-weekly-17",
        "knowledge-document-inventory-east-04"
      ]
    },
    "title": "收入增速异常"
  }' \
  >"${ANALYSIS_TASK_RESPONSE}"

readonly ANALYSIS_TASK_ID="$(json_field "${ANALYSIS_TASK_RESPONSE}" "analysisTaskId")"
readonly WORKSPACE_ID="$(json_field "${ANALYSIS_TASK_RESPONSE}" "workspaceId")"
readonly USER_ID="$(json_field "${ANALYSIS_TASK_RESPONSE}" "userId")"

printf 'analysisTaskId=%s\n' "${ANALYSIS_TASK_ID}"

printf 'POST %s/conversations\n' "${NORMALIZED_BASE_URL}"
curl -fsS \
  -X POST \
  -H 'Content-Type: application/json' \
  "${NORMALIZED_BASE_URL}/conversations" \
  -d "{
    \"workspaceId\": \"${WORKSPACE_ID}\",
    \"userId\": \"${USER_ID}\",
    \"analysisTaskId\": \"${ANALYSIS_TASK_ID}\",
    \"title\": \"收入增速异常\"
  }" \
  >"${CONVERSATION_RESPONSE}"

readonly CONVERSATION_ID="$(json_field "${CONVERSATION_RESPONSE}" "conversationId")"
printf 'conversationId=%s\n' "${CONVERSATION_ID}"

printf 'POST %s/analysis-runs\n' "${NORMALIZED_BASE_URL}"
curl -fsS \
  -X POST \
  -H 'Content-Type: application/json' \
  "${NORMALIZED_BASE_URL}/analysis-runs" \
  -d "{
    \"workspaceId\": \"${WORKSPACE_ID}\",
    \"userId\": \"${USER_ID}\",
    \"analysisTaskId\": \"${ANALYSIS_TASK_ID}\",
    \"conversationId\": \"${CONVERSATION_ID}\"
  }" \
  >"${ANALYSIS_RUN_RESPONSE}"

readonly RUN_ID="$(json_field "${ANALYSIS_RUN_RESPONSE}" "runId")"
printf 'runId=%s\n' "${RUN_ID}"

printf 'GET %s/analysis-runs/%s\n' "${NORMALIZED_BASE_URL}" "${RUN_ID}"
curl -fsS "${NORMALIZED_BASE_URL}/analysis-runs/${RUN_ID}" >"${GET_RUN_RESPONSE}"

printf 'GET %s/analysis-runs/%s/conversation\n' "${NORMALIZED_BASE_URL}" "${RUN_ID}"
curl -fsS "${NORMALIZED_BASE_URL}/analysis-runs/${RUN_ID}/conversation" \
  >"${GET_RUN_CONVERSATION_RESPONSE}"

printf 'GET %s/conversations/%s\n' "${NORMALIZED_BASE_URL}" "${CONVERSATION_ID}"
curl -fsS "${NORMALIZED_BASE_URL}/conversations/${CONVERSATION_ID}" \
  >"${GET_CONVERSATION_RESPONSE}"

printf 'analysisRun.status=%s\n' "$(json_field "${GET_RUN_RESPONSE}" "status")"
printf 'analysisRun.phase=%s\n' "$(json_field "${GET_RUN_RESPONSE}" "phase")"
printf 'conversation.currentRunId=%s\n' "$(json_field "${GET_CONVERSATION_RESPONSE}" "currentRunId")"
