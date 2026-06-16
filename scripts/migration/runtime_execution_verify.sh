#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly SQL_TEMPLATE="${REPO_ROOT}/database/mysql/queries/005_analysis_runtime_execution_verify.sql"

run_id="${IAP_RUNTIME_VERIFY_RUN_ID:-${1:-}}"

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

render_sql() {
  python3 - "$SQL_TEMPLATE" "$run_id" <<'PY'
from pathlib import Path
import sys

template_path = Path(sys.argv[1])
run_id = sys.argv[2]
template = template_path.read_text(encoding="utf-8")
print(template.replace("__RUN_ID__", run_id))
PY
}

line_value() {
  local output="$1"
  local key="$2"
  printf '%s\n' "${output}" | awk -F= -v key="${key}" '$1 == key { print $2 }'
}

[[ -n "${run_id}" ]] || die "Missing runId. Set IAP_RUNTIME_VERIFY_RUN_ID or pass runId as the first argument."
require_command python3

verify_output="$(render_sql | "${REPO_ROOT}/scripts/migration/runtime_foundation.sh" query-json)"
printf '%s\n' "${verify_output}"

expected_lines=(
  "runId=${run_id}"
  "analysisRun.status=running"
  "analysisRun.phase=synthesis"
  "analysisRun.completed.exists=0"
  "execution_attempts.run.row_count=1"
  "execution_attempts.released.row_count=1"
  "run_events.worker_claim.exists=1"
  "run_events.run_started.exists=1"
  "run_events.context_bound.exists=1"
  "run_events.tool_requested.exists=1"
  "run_events.tool_completed.exists=1"
  "run_events.model_started.exists=1"
  "run_events.model_completed.exists=1"
  "run_events.synthesis.exists=1"
  "tool_calls.run.row_count=1"
  "model_calls.run.row_count=1"
  "source_evidence.run.row_count=0"
  "reports.run.row_count=0"
  "decisions.run.row_count=0"
  "messages.assistant.run.row_count=0"
  "message_streams.run.row_count=0"
)

for expected_line in "${expected_lines[@]}"; do
  if ! grep -Fqx -- "${expected_line}" <<<"${verify_output}"; then
    die "Missing expected execution verify line: ${expected_line}"
  fi
done

tool_calls_count="$(line_value "${verify_output}" "tool_calls.run.row_count")"
model_calls_count="$(line_value "${verify_output}" "model_calls.run.row_count")"
[[ "${tool_calls_count}" -gt 0 ]] || die "Expected tool_calls.run.row_count > 0"
[[ "${model_calls_count}" -gt 0 ]] || die "Expected model_calls.run.row_count > 0"
