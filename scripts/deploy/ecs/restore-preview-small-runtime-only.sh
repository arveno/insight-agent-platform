#!/usr/bin/env bash
set -Eeuo pipefail

readonly REMOTE_ROOT="/opt/insight-agent-platform"
readonly CURRENT_ROOT="${REMOTE_ROOT}/current"
readonly COMPOSE_FILE="${REMOTE_ROOT}/deploy/docker/compose.ecs.preview.yml"
readonly ENV_FILE="${REMOTE_ROOT}/env/ecs-preview.env"
readonly LIGHTWEIGHT_SMOKE_SCRIPT="${CURRENT_ROOT}/scripts/smoke/ecs-preview-lightweight.sh"

log() {
  printf '[preview-small-restore] %s\n' "$*"
}

die() {
  printf '[preview-small-restore] ERROR: %s\n' "$*" >&2
  exit 1
}

require_explicit_authorization() {
  [[ "${IAP_PREVIEW_SMALL_RESTORE_AUTHORIZED:-}" == "1" ]] || die \
    "Set IAP_PREVIEW_SMALL_RESTORE_AUTHORIZED=1 only for manual ECS execution or an explicitly authorized remote run."
}

require_ecs_layout() {
  [[ -f "${COMPOSE_FILE}" ]] || die "Missing ECS compose file: ${COMPOSE_FILE}"
  [[ -f "${ENV_FILE}" ]] || die "Missing ECS env file: ${ENV_FILE}"
  [[ -f "${LIGHTWEIGHT_SMOKE_SCRIPT}" ]] || die "Missing lightweight smoke script: ${LIGHTWEIGHT_SMOKE_SCRIPT}"
}

require_commands() {
  command -v docker >/dev/null 2>&1 || die "docker is required."
  command -v curl >/dev/null 2>&1 || die "curl is required."
  command -v systemctl >/dev/null 2>&1 || die "systemctl is required."
}

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

ensure_docker_running() {
  if systemctl is-active --quiet docker.service; then
    log "docker.service already active."
    return 0
  fi

  log "Starting docker.service and docker.socket."
  sudo systemctl start docker.socket docker.service
}

keep_worker_stopped() {
  if compose_cmd config --services 2>/dev/null | grep -qx 'agent-worker'; then
    log "Stopping agent-worker to preserve runtime-only restore."
    compose_cmd stop agent-worker >/dev/null 2>&1 || true
  else
    log "agent-worker is not part of the default preview-small compose."
  fi
}

start_runtime_only_stack() {
  log "Starting mysql redis caddy agent-runtime only."
  compose_cmd up -d mysql redis caddy agent-runtime
}

check_health() {
  local payload
  payload="$(curl --silent --show-error --fail http://127.0.0.1/health)"
  log "PASS /health ${payload}"
}

run_lightweight_smoke_if_requested() {
  if [[ -z "${PREVIEW_BASE_URL:-}" ]]; then
    log "PREVIEW_BASE_URL not set; skipping optional lightweight smoke."
    return 0
  fi

  log "Running optional lightweight smoke."
  PREVIEW_BASE_URL="${PREVIEW_BASE_URL}" bash "${LIGHTWEIGHT_SMOKE_SCRIPT}"
}

main() {
  require_explicit_authorization
  require_ecs_layout
  require_commands
  ensure_docker_running
  keep_worker_stopped
  start_runtime_only_stack
  check_health
  run_lightweight_smoke_if_requested
}

main "$@"
