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
  "tool_calls.run.row_count=1"
  "model_calls.run.row_count=1"
  "source_evidence.run.row_count=2"
  "source_evidence.channel.exists=1"
  "source_evidence.inventory.exists=1"
  "reports.run.row_count=1"
  "report.revenue_gap.exists=1"
  "decisions.run.row_count=1"
  "decision.revenue_gap.exists=1"
  "messages.assistant.run.row_count=1"
  "message.report_link.exists=1"
  "message.source_evidence.channel.exists=1"
  "message.source_evidence.inventory.exists=1"
  "message_streams.run.row_count=0"
  "run_events.verification.started.exists=1"
  "run_events.verification.passed.exists=1"
  "run_events.delivery.started.exists=1"
  "run_events.artifact.persisted.exists=1"
  "run_events.run.completed.exists=1"
)

for expected_line in "${expected_lines[@]}"; do
  if ! grep -Fqx -- "${expected_line}" <<<"${verify_output}"; then
    die "Missing expected result delivery verify line: ${expected_line}"
  fi
done

source_evidence_count="$(line_value "${verify_output}" "source_evidence.run.row_count")"
reports_count="$(line_value "${verify_output}" "reports.run.row_count")"
decisions_count="$(line_value "${verify_output}" "decisions.run.row_count")"
assistant_count="$(line_value "${verify_output}" "messages.assistant.run.row_count")"
message_stream_count="$(line_value "${verify_output}" "message_streams.run.row_count")"

[[ "${source_evidence_count}" -gt 0 ]] || die "Expected source_evidence.run.row_count > 0"
[[ "${reports_count}" -gt 0 ]] || die "Expected reports.run.row_count > 0"
[[ "${decisions_count}" -gt 0 ]] || die "Expected decisions.run.row_count > 0"
[[ "${assistant_count}" -gt 0 ]] || die "Expected messages.assistant.run.row_count > 0"
[[ "${message_stream_count}" -eq 0 ]] || die "Expected message_streams.run.row_count == 0"
