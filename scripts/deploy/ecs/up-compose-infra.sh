#!/usr/bin/env bash
set -Eeuo pipefail

readonly COMPOSE_FILE="/opt/insight-agent-platform/deploy/docker/compose.ecs.preview.yml"
readonly ENV_FILE="/opt/insight-agent-platform/env/ecs-preview.env"
readonly SERVICES=(mysql redis caddy)

log() {
  printf '[ecs-compose-up] %s\n' "$*"
}

die() {
  printf '[ecs-compose-up] ERROR: %s\n' "$*" >&2
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

ensure_required_files() {
  [[ -f "${COMPOSE_FILE}" ]] || die "Missing compose file: ${COMPOSE_FILE}"
  [[ -f "${ENV_FILE}" ]] || die "Missing env file: ${ENV_FILE}"
}

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

validate_compose_config() {
  compose_cmd config >/dev/null
}

start_infra_services() {
  log "Starting ECS preview infra services: ${SERVICES[*]}."
  compose_cmd up -d "${SERVICES[@]}"
}

print_next_steps() {
  cat <<'EOF'

[ecs-compose-up] Infra compose foundation is up.
[ecs-compose-up] Next steps:
[ecs-compose-up] 1. Run bash scripts/deploy/ecs/verify-compose-infra.sh
[ecs-compose-up] 2. Later follow-up PRs can attach runtime / worker / frontend build artifacts.
EOF
}

main() {
  require_deploy_user
  require_docker_group_session
  ensure_required_files
  validate_compose_config
  start_infra_services
  print_next_steps
}

main "$@"
