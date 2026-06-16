#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly SQL_TEMPLATE="${REPO_ROOT}/database/mysql/queries/006_analysis_runtime_result_delivery_verify.sql"

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
  "analysisRun.status=completed"
  "analysisRun.phase=delivery"
  "analysisRun.outcome=success"
  "analysisRun.completed.exists=1"
  "decisions.report_link.exists=1"
  "messages.assistant.final.same_message_id=1"
  "messages.assistant.report_link.exists=1"
  "messages.assistant.turn.reused=1"
  "messages.assistant.source_evidence.non_empty=1"
  "messages.assistant.source_evidence.linkage.valid=1"
  "reports.source_evidence.non_empty=1"
  "reports.source_evidence.linkage.valid=1"
  "message_streams.message_link.exists=1"
  "message_streams.conversation_link.exists=1"
  "message_streams.run_link.exists=1"
  "message_streams.sequence.contiguous=1"
  "message_streams.terminal.exists=1"
  "message_streams.terminal.single=1"
  "message_streams.no_orphans=1"
  "run_events.verification.started.exists=1"
  "run_events.verification.passed.exists=1"
  "run_events.delivery.started.exists=1"
  "run_events.artifact.persisted.exists=1"
  "run_events.run.completed.exists=1"
  "run_events.verification.started.before.verification.passed=1"
  "run_events.verification.passed.before.delivery.started=1"
  "run_events.delivery.started.before.artifact.persisted=1"
  "run_events.artifact.persisted.before.run.completed=1"
)

for expected_line in "${expected_lines[@]}"; do
  if ! grep -Fqx -- "${expected_line}" <<<"${verify_output}"; then
    die "Missing expected result delivery verify line: ${expected_line}"
  fi
done

source_evidence_count="$(line_value "${verify_output}" "source_evidence.run.row_count")"
reports_count="$(line_value "${verify_output}" "reports.run.row_count")"
report_sections_count="$(line_value "${verify_output}" "report_sections.run.row_count")"
decisions_count="$(line_value "${verify_output}" "decisions.run.row_count")"
assistant_count="$(line_value "${verify_output}" "messages.assistant.run.row_count")"
tool_call_count="$(line_value "${verify_output}" "tool_calls.run.row_count")"
tool_call_succeeded_count="$(line_value "${verify_output}" "tool_calls.succeeded.row_count")"
model_call_count="$(line_value "${verify_output}" "model_calls.run.row_count")"
model_call_succeeded_count="$(line_value "${verify_output}" "model_calls.succeeded.row_count")"
message_stream_count="$(line_value "${verify_output}" "message_streams.run.row_count")"

[[ "${tool_call_count}" -gt 0 ]] || die "Expected tool_calls.run.row_count > 0"
[[ "${tool_call_succeeded_count}" -gt 0 ]] || die "Expected tool_calls.succeeded.row_count > 0"
[[ "${model_call_count}" -gt 0 ]] || die "Expected model_calls.run.row_count > 0"
[[ "${model_call_succeeded_count}" -gt 0 ]] || die "Expected model_calls.succeeded.row_count > 0"
[[ "${source_evidence_count}" -gt 0 ]] || die "Expected source_evidence.run.row_count > 0"
[[ "${reports_count}" -gt 0 ]] || die "Expected reports.run.row_count > 0"
[[ "${report_sections_count}" -gt 0 ]] || die "Expected report_sections.run.row_count > 0"
[[ "${decisions_count}" -gt 0 ]] || die "Expected decisions.run.row_count > 0"
[[ "${assistant_count}" -gt 0 ]] || die "Expected messages.assistant.run.row_count > 0"
[[ "${message_stream_count}" -gt 0 ]] || die "Expected message_streams.run.row_count > 0"
