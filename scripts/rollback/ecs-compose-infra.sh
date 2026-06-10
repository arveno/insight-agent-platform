#!/usr/bin/env bash
set -Eeuo pipefail

readonly COMPOSE_FILE="/opt/insight-agent-platform/deploy/docker/compose.ecs.preview.yml"
readonly ENV_FILE="/opt/insight-agent-platform/env/ecs-preview.env"
readonly DATA_DIRS=(
  "/opt/insight-agent-platform/shared/data/mysql"
  "/opt/insight-agent-platform/shared/data/redis"
)

reset_data=0

log() {
  printf '[ecs-compose-rollback] %s\n' "$*"
}

die() {
  printf '[ecs-compose-rollback] ERROR: %s\n' "$*" >&2
  exit 1
}

require_deploy_user() {
  local current_user
  current_user="$(id -un)"
  [[ "${current_user}" == "deploy" ]] || die "Run this script as the deploy user. Current user: ${current_user}."
}

require_docker_group_session() {
  id -nG | tr ' ' '\n' | grep -qx docker || die "Current deploy shell does not have docker group membership."
}

parse_args() {
  if (($# == 0)); then
    return
  fi

  if (($# == 1)) && [[ "$1" == "--reset-data" ]]; then
    reset_data=1
    return
  fi

  die "Unknown arguments. Usage: bash scripts/rollback/ecs-compose-infra.sh [--reset-data]"
}

ensure_required_files() {
  [[ -f "${COMPOSE_FILE}" ]] || die "Missing compose file: ${COMPOSE_FILE}"
  [[ -f "${ENV_FILE}" ]] || die "Missing env file: ${ENV_FILE}"
}

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

stop_infra_services() {
  log "Stopping compose infra services: mysql redis caddy."
  compose_cmd down --remove-orphans
}

reset_infra_data() {
  local dir

  for dir in "${DATA_DIRS[@]}"; do
    install -d -m 0755 "${dir}"
    find "${dir}" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
  done

  log "MySQL / Redis data directories were reset."
}

print_result() {
  if ((reset_data == 1)); then
    log "Rollback finished. Containers stopped and data was reset."
  else
    log "Rollback finished. Containers stopped and MySQL / Redis data was preserved."
  fi
}

main() {
  parse_args "$@"
  require_deploy_user
  require_docker_group_session
  ensure_required_files
  stop_infra_services

  if ((reset_data == 1)); then
    reset_infra_data
  fi

  print_result
}

main "$@"
