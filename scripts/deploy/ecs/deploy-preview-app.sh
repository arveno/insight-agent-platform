#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
readonly REMOTE_ROOT="/opt/insight-agent-platform"
readonly REMOTE_FRONTEND_DIR="${REMOTE_ROOT}/shared/frontend"
readonly REMOTE_DOCKER_DIR="${REMOTE_ROOT}/deploy/docker"
readonly REMOTE_REPO_DIR="${REMOTE_ROOT}/repo"
readonly REMOTE_ENV_FILE="${REMOTE_ROOT}/env/ecs-preview.env"
readonly REMOTE_COMPOSE_FILE="${REMOTE_DOCKER_DIR}/compose.ecs.preview.yml"
readonly REMOTE_INIT_ENV_SCRIPT="${REMOTE_REPO_DIR}/scripts/deploy/ecs/init-compose-env.sh"
readonly REMOTE_ROLLBACK_SCRIPT="${REMOTE_REPO_DIR}/scripts/rollback/ecs-compose-infra.sh"

dry_run=0
reset_data=0
ecs_host_alias="${IAP_ECS_HOST_ALIAS:-${ECS_HOST_ALIAS:-iap-ecs}}"
preview_base_url="${PREVIEW_BASE_URL:-}"

log() {
  printf '[ecs-preview-deploy] %s\n' "$*"
}

die() {
  printf '[ecs-preview-deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

parse_args() {
  while (($# > 0)); do
    case "$1" in
      --dry-run)
        dry_run=1
        ;;
      --reset-data)
        reset_data=1
        ;;
      *)
        die "Unknown argument: $1"
        ;;
    esac
    shift
  done
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

run_local_cmd() {
  if ((dry_run == 1)); then
    printf '[ecs-preview-deploy] DRY-RUN local:'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi

  "$@"
}

run_remote_cmd() {
  local command_text="$1"

  if ((dry_run == 1)); then
    printf '[ecs-preview-deploy] DRY-RUN remote(%s): %s\n' "${ecs_host_alias}" "${command_text}"
    return 0
  fi

  ssh "${ecs_host_alias}" "${command_text}"
}

run_rsync() {
  local source_path="$1"
  local destination_path="$2"
  shift 2

  local -a cmd=(rsync -av --delete)
  cmd+=("$@" "${source_path}" "${destination_path}")

  if ((dry_run == 1)); then
    printf '[ecs-preview-deploy] DRY-RUN rsync:'
    printf ' %q' "${cmd[@]}"
    printf '\n'
    return 0
  fi

  "${cmd[@]}"
}

ensure_local_prerequisites() {
  [[ -d "${REPO_ROOT}/apps/web" ]] || die "Missing apps/web workspace."
  [[ -f "${REPO_ROOT}/deploy/docker/compose.ecs.preview.yml" ]] || die "Missing preview compose file."
  require_command pnpm
  require_command rsync
  require_command ssh
}

ensure_remote_directories() {
  run_remote_cmd "mkdir -p '${REMOTE_FRONTEND_DIR}' '${REMOTE_DOCKER_DIR}' '${REMOTE_REPO_DIR}'"
}

build_frontend() {
  log "Building frontend static assets."
  run_local_cmd pnpm --dir "${REPO_ROOT}/apps/web" build
}

sync_frontend_dist() {
  log "Syncing frontend dist to ${REMOTE_FRONTEND_DIR}."
  run_rsync \
    "${REPO_ROOT}/apps/web/dist/" \
    "${ecs_host_alias}:${REMOTE_FRONTEND_DIR}/"
}

sync_docker_assets() {
  log "Syncing deploy/docker assets to ${REMOTE_DOCKER_DIR}."
  run_rsync \
    "${REPO_ROOT}/deploy/docker/" \
    "${ecs_host_alias}:${REMOTE_DOCKER_DIR}/"
}

sync_repo_build_context() {
  log "Syncing reproducible runtime build context to ${REMOTE_REPO_DIR}."
  run_rsync \
    "${REPO_ROOT}/" \
    "${ecs_host_alias}:${REMOTE_REPO_DIR}/" \
    --exclude .git \
    --exclude .DS_Store \
    --exclude node_modules \
    --exclude .venv \
    --exclude .pytest_cache \
    --exclude .mypy_cache \
    --exclude .ruff_cache \
    --exclude .tmp \
    --exclude __pycache__ \
    --exclude '*.pyc' \
    --exclude .env \
    --exclude '.env.*' \
    --exclude '**/.env' \
    --exclude '**/.env.*' \
    --exclude '*.pem' \
    --exclude '*.key' \
    --exclude '*.p12' \
    --exclude '*.pfx' \
    --exclude apps/web/dist
}

ensure_remote_env_file() {
  log "Ensuring ECS preview env file exists."
  run_remote_cmd "if [ ! -f '${REMOTE_ENV_FILE}' ]; then bash '${REMOTE_INIT_ENV_SCRIPT}'; fi"
}

reset_remote_data_if_requested() {
  if ((reset_data == 0)); then
    return 0
  fi

  log "Resetting ECS preview data before deployment."
  run_remote_cmd "bash '${REMOTE_ROLLBACK_SCRIPT}' --reset-data"
}

compose_remote() {
  run_remote_cmd "docker compose --env-file '${REMOTE_ENV_FILE}' -f '${REMOTE_COMPOSE_FILE}' $*"
}

build_runtime_image() {
  log "Building remote agent-runtime image."
  compose_remote "build agent-runtime"
}

start_preview_stack() {
  log "Starting preview stack: mysql redis agent-runtime caddy."
  compose_remote "up -d mysql redis agent-runtime caddy"
}

recreate_caddy_container() {
  log "Recreating Caddy container to pick up the latest bind-mounted Caddyfile."
  compose_remote "up -d --force-recreate caddy"
}

reload_caddy_config() {
  log "Reloading Caddy config."
  compose_remote "exec -T caddy caddy reload --config /etc/caddy/Caddyfile"
}

run_migration_step() {
  local step="$1"

  if ((dry_run == 1)); then
    log "DRY-RUN migration step: ${step}"
    return 0
  fi

  (
    cd "${REPO_ROOT}"
    IAP_MIGRATION_TARGET=ecs \
    IAP_MIGRATION_ECS_HOST_ALIAS="${ecs_host_alias}" \
    ./scripts/migration/runtime_foundation.sh "${step}"
  )
}

run_migration_flow() {
  log "Running ECS migration/seed/query-verify."
  run_migration_step migrate
  run_migration_step seed
  run_migration_step query-verify
}

resolve_preview_url() {
  if [[ -n "${preview_base_url}" ]]; then
    printf '%s\n' "${preview_base_url}"
    return 0
  fi

  if ((dry_run == 1)); then
    printf 'http://<ECS_IP_OR_DOMAIN>\n'
    return 0
  fi

  local configured_host
  configured_host="$(ssh -G "${ecs_host_alias}" | awk '/^hostname / {print $2; exit}')"
  if [[ -n "${configured_host}" && "${configured_host}" != "${ecs_host_alias}" ]]; then
    printf 'http://%s\n' "${configured_host}"
    return 0
  fi

  local primary_ip
  primary_ip="$(ssh "${ecs_host_alias}" "hostname -I | awk '{print \$1}'")"
  [[ -n "${primary_ip}" ]] || die "Unable to resolve ECS host. Set PREVIEW_BASE_URL explicitly."
  printf 'http://%s\n' "${primary_ip}"
}

print_result() {
  local resolved_url
  resolved_url="$(resolve_preview_url)"
  log "Preview login URL: ${resolved_url}/login"
}

main() {
  parse_args "$@"
  ensure_local_prerequisites
  ensure_remote_directories
  build_frontend
  sync_frontend_dist
  sync_docker_assets
  sync_repo_build_context
  ensure_remote_env_file
  reset_remote_data_if_requested
  build_runtime_image
  start_preview_stack
  recreate_caddy_container
  reload_caddy_config
  run_migration_flow
  print_result
}

main "$@"
