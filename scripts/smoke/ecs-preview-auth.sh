#!/usr/bin/env bash
set -Eeuo pipefail

preview_base_url="${PREVIEW_BASE_URL:-}"
cookie_jar=""
readonly CURL_ARGS=(--silent --show-error --fail --connect-timeout 5 --max-time 20)

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

assert_health() {
  local payload
  payload="$(curl "${CURL_ARGS[@]}" "${preview_base_url}/runtime/health")"
  JSON_PAYLOAD="${payload}" python3 - <<'PY'
import json
import os

payload = json.loads(os.environ["JSON_PAYLOAD"])
assert payload["status"] == "ok", payload
assert payload["service"] == "agent-runtime", payload
PY
  log "PASS runtime health"
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

login_seed_user() {
  local payload
  cookie_jar="$(mktemp)"
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie-jar "${cookie_jar}" \
      --header "Content-Type: application/json" \
      --data '{"email":"zoe@northstar.example.com","password":"zoe-password"}' \
      "${preview_base_url}/auth/login"
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
      "${preview_base_url}/auth/me"
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
      "${preview_base_url}/workspaces"
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

assert_workspace_switch() {
  local payload
  payload="$(
    curl \
      "${CURL_ARGS[@]}" \
      --cookie "${cookie_jar}" \
      --cookie-jar "${cookie_jar}" \
      --header "Content-Type: application/json" \
      --data '{"workspaceId":"workspace-northstar-retail-sea"}' \
      "${preview_base_url}/auth/select-workspace"
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
  login_seed_user
  assert_auth_me
  assert_workspaces
  assert_workspace_switch
  log "PASS auth smoke completed"
}

main "$@"
