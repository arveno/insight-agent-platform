#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
readonly COMPOSE_FILE="${REPO_ROOT}/deploy/docker/compose.ecs.preview.yml"
readonly ENV_FILE="${REPO_ROOT}/deploy/docker/env.ecs.preview.example"
readonly ALLOWED_SERVICES=(mysql redis caddy agent-runtime)
readonly BLOCKED_SERVICES=(agent-worker milvus milvus-lite)

failures=0
DEFAULT_SERVICES=()

log() {
  printf '[preview-small-config] %s\n' "$*"
}

pass() {
  printf '[preview-small-config] PASS: %s\n' "$*"
}

fail() {
  printf '[preview-small-config] FAIL: %s\n' "$*" >&2
  failures=$((failures + 1))
}

die() {
  printf '[preview-small-config] ERROR: %s\n' "$*" >&2
  exit 1
}

require_docker_compose() {
  command -v docker >/dev/null 2>&1 || die "docker is required for local preview-small config verification."
  docker compose version >/dev/null 2>&1 || die "docker compose is required for local preview-small config verification."
}

array_contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    if [[ "${item}" == "${needle}" ]]; then
      return 0
    fi
  done
  return 1
}

load_default_services() {
  local output
  local service
  output="$(
    docker compose \
      --env-file "${ENV_FILE}" \
      -f "${COMPOSE_FILE}" \
      config --services
  )" || die "docker compose config --services failed for ${COMPOSE_FILE}."

  DEFAULT_SERVICES=()
  while IFS= read -r service; do
    [[ -n "${service}" ]] || continue
    DEFAULT_SERVICES+=("${service}")
  done <<EOF
${output}
EOF

  if ((${#DEFAULT_SERVICES[@]} == 0)); then
    die "docker compose config returned no default services."
  fi
}

check_blocked_services() {
  local service
  for service in "${BLOCKED_SERVICES[@]}"; do
    if array_contains "${service}" "${DEFAULT_SERVICES[@]}"; then
      fail "blocked default service present: ${service}"
    else
      pass "blocked default service absent: ${service}"
    fi
  done
}

check_allowed_services() {
  local service
  for service in "${DEFAULT_SERVICES[@]}"; do
    if array_contains "${service}" "${ALLOWED_SERVICES[@]}"; then
      pass "allowed default service present: ${service}"
    else
      fail "unexpected default service present: ${service}"
    fi
  done

  for service in "${ALLOWED_SERVICES[@]}"; do
    if array_contains "${service}" "${DEFAULT_SERVICES[@]}"; then
      pass "required default service present: ${service}"
    else
      fail "required default service missing: ${service}"
    fi
  done
}

main() {
  require_docker_compose
  load_default_services
  log "Default services: ${DEFAULT_SERVICES[*]}"
  check_blocked_services
  check_allowed_services

  if ((failures > 0)); then
    exit 1
  fi

  pass "preview-small default services are limited to mysql redis caddy agent-runtime"
}

main "$@"
