#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly SQL_TEMPLATE="${REPO_ROOT}/database/mysql/queries/008_analysis_feedback_evaluation_verify.sql"

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
  "feedback.report_link.exists=1"
  "feedback.workspace_link.exists=1"
  "evaluation_runs.status.needs_review.exists=1"
  "evaluation_runs.dataset_link.exists=1"
  "bad_cases.feedback_link.exists=1"
  "bad_cases.evaluation_run_link.exists=1"
  "feedback.negative.bad_case_link.exists=1"
)

for expected_line in "${expected_lines[@]}"; do
  if ! grep -Fqx -- "${expected_line}" <<<"${verify_output}"; then
    die "Missing expected feedback/evaluation verify line: ${expected_line}"
  fi
done

feedback_count="$(line_value "${verify_output}" "feedback.run.row_count")"
evaluation_run_count="$(line_value "${verify_output}" "evaluation_runs.run.row_count")"
bad_case_count="$(line_value "${verify_output}" "bad_cases.run.row_count")"

[[ "${feedback_count}" -gt 0 ]] || die "Expected feedback.run.row_count > 0"
[[ "${evaluation_run_count}" -gt 0 ]] || die "Expected evaluation_runs.run.row_count > 0"
[[ "${bad_case_count}" -gt 0 ]] || die "Expected bad_cases.run.row_count > 0"
