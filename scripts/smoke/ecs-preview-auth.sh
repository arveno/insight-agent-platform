#!/usr/bin/env bash
set -Eeuo pipefail

preview_base_url="${PREVIEW_BASE_URL:-}"
cookie_jar=""
readonly CURL_ARGS=(--silent --show-error --fail --connect-timeout 5 --max-time 20)
readonly API_BASE_PATH="/api"

log() {
  printf '[ecs-preview-smoke] %s\n' "$*"
}

die() {
  printf '[ecs-preview-smoke] ERROR: %s\n' "$*" >&2
  exit 1
}

cleanup() {
  if [[ -n "${cookie_jar}" && -f "${cookie_jar}" ]]; then
    rm -f "${cookie_jar}"
  fi
}

require_prerequisites() {
  [[ -n "${preview_base_url}" ]] || die "Set PREVIEW_BASE_URL, for example http://<ECS_IP_OR_DOMAIN>."
  command -v curl >/dev/null 2>&1 || die "curl is required."
  command -v python3 >/dev/null 2>&1 || die "python3 is required."
}

api_url() {
  local path="$1"
  printf '%s%s%s\n' "${preview_base_url}" "${API_BASE_PATH}" "${path}"
}

assert_health() {
  local payload
  payload="$(curl "${CURL_ARGS[@]}" "${preview_base_url}/health")"
  JSON_PAYLOAD="${payload}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["status"] == "ok", payload
assert payload["service"] == "agent-runtime", payload
PY
  log "PASS /health"
}

assert_login_page() {
  local body_file
  body_file="$(mktemp)"
  curl "${CURL_ARGS[@]}" "${preview_base_url}/login" >"${body_file}"
  grep -qi "<html" "${body_file}" || {
    rm -f "${body_file}"
    die "/login did not return HTML."
  }
  rm -f "${body_file}"
  log "PASS login page"
}

assert_metrics_page_route() {
  local body_file
  body_file="$(mktemp)"
  curl "${CURL_ARGS[@]}" "${preview_base_url}/metrics" >"${body_file}"
  grep -qi "<html" "${body_file}" || {
    cat "${body_file}" >&2
    rm -f "${body_file}"
    die "/metrics did not return HTML."
  }
  grep -q 'id="root"' "${body_file}" || {
    cat "${body_file}" >&2
    rm -f "${body_file}"
    die "/metrics did not return the SPA root container."
  }
  grep -q '<script type="module"' "${body_file}" || {
    cat "${body_file}" >&2
    rm -f "${body_file}"
    die "/metrics did not return the SPA script tag."
  }
  HTML_BODY_PATH="${body_file}" python3 - <<'PY'
import json
import os
from pathlib import Path

body = Path(os.environ["HTML_BODY_PATH"]).read_text()
try:
    json.loads(body)
except json.JSONDecodeError:
    pass
else:
    raise AssertionError("/metrics unexpectedly returned JSON.")
PY
  rm -f "${body_file}"
  log "PASS metrics page route"
}

assert_metrics_unauthenticated() {
  local body_file
  local status_code
  body_file="$(mktemp)"
  status_code="$(
    curl \
      --silent \
      --show-error \
      --connect-timeout 5 \
      --max-time 20 \
      --output "${body_file}" \
      --write-out "%{http_code}" \
      "$(api_url "/metrics")"
  )"
  [[ "${status_code}" == "401" ]] || {
    cat "${body_file}" >&2
    rm -f "${body_file}"
    die "Expected unauthenticated /api/metrics to return 401, got ${status_code}."
  }
  JSON_PAYLOAD="$(cat "${body_file}")" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload == {
    "errorCode": "UNAUTHORIZED",
    "message": "Authentication session is missing or invalid.",
}, payload
PY
  rm -f "${body_file}"
  log "PASS unauthenticated metrics"
}

login_seed_user() {
  local payload
  cookie_jar="$(mktemp)"
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie-jar "${cookie_jar}" \
      --header "Content-Type: application/json" \
      --data '{"email":"zoe@northstar.example.com","password":"zoe-password"}' \
      "$(api_url "/auth/login")"
  )"
  JSON_PAYLOAD="${payload}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["user"]["userId"] == "user-zoe", payload
assert payload["authSession"]["currentWorkspaceId"] == "workspace-northstar-retail-china", payload
PY
  [[ -s "${cookie_jar}" ]] || die "Login response did not persist a cookie jar."
  log "PASS auth login"
}

assert_auth_me() {
  local payload
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie "${cookie_jar}" \
      "$(api_url "/auth/me")"
  )"
  JSON_PAYLOAD="${payload}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["user"]["userId"] == "user-zoe", payload
assert payload["currentWorkspaceContext"]["workspaceId"] == "workspace-northstar-retail-china", payload
assert payload["currentWorkspaceContext"]["role"] == "analyst", payload
PY
  log "PASS auth me"
}

assert_workspaces() {
  local payload
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie "${cookie_jar}" \
      "$(api_url "/workspaces")"
  )"
  JSON_PAYLOAD="${payload}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
items = payload["items"]
assert len(items) == 2, items
workspace_ids = {item["workspace"]["workspaceId"] for item in items}
assert workspace_ids == {
    "workspace-northstar-retail-china",
    "workspace-northstar-retail-sea",
}, items
PY
  log "PASS workspace list"
}

assert_metrics_for_workspace() {
  local expected_workspace_id="$1"
  local expected_metric_ids_csv="$2"
  local payload
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie "${cookie_jar}" \
      "$(api_url "/metrics")"
  )"
  JSON_PAYLOAD="${payload}" EXPECTED_WORKSPACE_ID="${expected_workspace_id}" EXPECTED_METRIC_IDS="${expected_metric_ids_csv}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
expected_workspace_id = os.environ["EXPECTED_WORKSPACE_ID"]
expected_metric_ids = set(filter(None, os.environ["EXPECTED_METRIC_IDS"].split(",")))
items = payload["items"]
assert isinstance(items, list), payload
metric_ids = [item["metricId"] for item in items]
assert set(metric_ids) == expected_metric_ids, metric_ids
assert len(metric_ids) == len(expected_metric_ids), metric_ids
for item in items:
    assert item["workspaceId"] == expected_workspace_id, item
PY
  log "PASS metrics list ${expected_workspace_id}"
}

assert_metric_detail() {
  local metric_id="$1"
  local expected_workspace_id="$2"
  local payload
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie "${cookie_jar}" \
      "$(api_url "/metrics/${metric_id}")"
  )"
  JSON_PAYLOAD="${payload}" EXPECTED_METRIC_ID="${metric_id}" EXPECTED_WORKSPACE_ID="${expected_workspace_id}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["metricId"] == os.environ["EXPECTED_METRIC_ID"], payload
assert payload["workspaceId"] == os.environ["EXPECTED_WORKSPACE_ID"], payload
assert isinstance(payload["contextSources"], list), payload
PY
  log "PASS metric detail ${metric_id}"
}

assert_metric_not_found_in_current_workspace() {
  local metric_id="$1"
  local body_file
  local status_code
  body_file="$(mktemp)"
  status_code="$(
    curl \
      --silent \
      --show-error \
      --connect-timeout 5 \
      --max-time 20 \
      --cookie "${cookie_jar}" \
      --output "${body_file}" \
      --write-out "%{http_code}" \
      "$(api_url "/metrics/${metric_id}")"
  )"
  [[ "${status_code}" == "404" ]] || {
    cat "${body_file}" >&2
    rm -f "${body_file}"
    die "Expected /api/metrics/${metric_id} to return 404 in current workspace, got ${status_code}."
  }
  JSON_PAYLOAD="$(cat "${body_file}")" EXPECTED_METRIC_ID="${metric_id}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload == {
    "errorCode": "NOT_FOUND",
    "message": f"Metric not found: {os.environ['EXPECTED_METRIC_ID']}",
}, payload
PY
  rm -f "${body_file}"
  log "PASS metric 404 ${metric_id}"
}

assert_workspace_switch() {
  local payload
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie "${cookie_jar}" \
      --cookie-jar "${cookie_jar}" \
      --header "Content-Type: application/json" \
      --data '{"workspaceId":"workspace-northstar-retail-sea"}' \
      "$(api_url "/auth/select-workspace")"
  )"
  JSON_PAYLOAD="${payload}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["authSession"]["currentWorkspaceId"] == "workspace-northstar-retail-sea", payload
assert payload["currentWorkspaceContext"]["workspaceId"] == "workspace-northstar-retail-sea", payload
assert payload["currentWorkspaceContext"]["role"] == "viewer", payload
PY
  log "PASS workspace switch"
}

main() {
  trap cleanup EXIT
  require_prerequisites
  assert_health
  assert_login_page
  assert_metrics_page_route
  assert_metrics_unauthenticated
  login_seed_user
  assert_auth_me
  assert_workspaces
  assert_metrics_for_workspace \
    "workspace-northstar-retail-china" \
    "metric-recognized-revenue,metric-gross-margin,metric-refund-rate,metric-inventory-turnover"
  assert_metric_detail "metric-recognized-revenue" "workspace-northstar-retail-china"
  assert_workspace_switch
  assert_metrics_for_workspace \
    "workspace-northstar-retail-sea" \
    "metric-sea-recognized-revenue,metric-sea-delivery-delay-rate"
  assert_metric_not_found_in_current_workspace "metric-recognized-revenue"
  log "PASS auth smoke completed"
}

main "$@"
