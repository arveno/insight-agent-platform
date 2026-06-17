#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly SQL_TEMPLATE="${REPO_ROOT}/database/mysql/queries/007_analysis_model_gateway_failure_verify.sql"

run_id="${IAP_RUNTIME_VERIFY_RUN_ID:-${1:-}}"
expected_failure_class="${IAP_RUNTIME_EXPECTED_FAILURE_CLASS:-${2:-}}"

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
  printf '%s\n' "${output}" | awk -F= -v key="${key}" '$1 == key { print substr($0, length(key) + 2) }'
}

suggested_action() {
  local failure_class="$1"
  local retryable="$2"
  case "${failure_class}" in
    provider_auth_error|provider_quota_error|provider_model_not_found)
      printf 'fix_provider_env_or_configuration\n'
      ;;
    provider_timeout|provider_network_error|provider_rate_limit|provider_5xx|provider_cert_error)
      printf 'retry_and_compare_baseline_provider_health\n'
      ;;
    provider_response_schema_error|model_gateway_bug|worker_integration_bug)
      printf 'inspect_runtime_code_and_provider_contract\n'
      ;;
    *)
      if [[ "${retryable}" == "1" ]]; then
        printf 'retry_with_structured_diagnostics\n'
      else
        printf 'collect_diagnostics_and_compare_baseline\n'
      fi
      ;;
  esac
}

[[ -n "${run_id}" ]] || die "Missing runId. Set IAP_RUNTIME_VERIFY_RUN_ID or pass runId as the first argument."
require_command python3

verify_output="$(render_sql | "${REPO_ROOT}/scripts/migration/runtime_foundation.sh" query-json)"
printf '%s\n' "${verify_output}"

expected_lines=(
  "runId=${run_id}"
  "analysisRun.status=failed"
  "analysisRun.phase=synthesis"
  "model_calls.failed.row_count=1"
  "modelCall.status=failed"
  "run_events.model_call.failed.exists=1"
  "run_events.run.failed.exists=1"
  "secrets.authorization.exposed=0"
)

for expected_line in "${expected_lines[@]}"; do
  if ! grep -Fqx -- "${expected_line}" <<<"${verify_output}"; then
    die "Missing expected failure verify line: ${expected_line}"
  fi
done

failure_class="$(line_value "${verify_output}" "failureClass")"
analysis_run_failure_code="$(line_value "${verify_output}" "analysisRun.failureCode")"
run_event_model_error_code="$(line_value "${verify_output}" "run_events.model_call.failed.errorCode")"
run_event_run_error_code="$(line_value "${verify_output}" "run_events.run.failed.errorCode")"
retryable_value="$(line_value "${verify_output}" "retryable")"

[[ -n "${failure_class}" && "${failure_class}" != "NULL" ]] || die "Expected failureClass to be populated."
[[ "${analysis_run_failure_code}" == "${failure_class}" ]] || die "AnalysisRun.failureCode must match failureClass."
[[ "${run_event_model_error_code}" == "${failure_class}" ]] || die "model_call.failed.errorCode must match failureClass."
[[ "${run_event_run_error_code}" == "${failure_class}" ]] || die "run.failed.errorCode must match failureClass."

if [[ -n "${expected_failure_class}" && "${failure_class}" != "${expected_failure_class}" ]]; then
  die "Expected failureClass=${expected_failure_class}, got ${failure_class}."
fi

printf 'status=failed\n'
printf 'suggestedAction=%s\n' "$(suggested_action "${failure_class}" "${retryable_value}")"
