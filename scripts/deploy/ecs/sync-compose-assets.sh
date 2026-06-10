#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
readonly LOCAL_DOCKER_DIR="${REPO_ROOT}/deploy/docker"
readonly REMOTE_DOCKER_DIR="/opt/insight-agent-platform/deploy/docker"
readonly ECS_HOST_ALIAS="${ECS_HOST_ALIAS:-iap-ecs}"

log() {
  printf '[ecs-compose-sync] %s\n' "$*"
}

die() {
  printf '[ecs-compose-sync] ERROR: %s\n' "$*" >&2
  exit 1
}

ensure_local_assets() {
  [[ -d "${LOCAL_DOCKER_DIR}" ]] || die "Missing local docker asset directory: ${LOCAL_DOCKER_DIR}"
  command -v rsync >/dev/null 2>&1 || die "rsync is required."
}

sync_assets() {
  log "Syncing ${LOCAL_DOCKER_DIR} to ${ECS_HOST_ALIAS}:${REMOTE_DOCKER_DIR}."
  rsync \
    -av \
    --delete \
    --rsync-path="mkdir -p ${REMOTE_DOCKER_DIR} && rsync" \
    "${LOCAL_DOCKER_DIR}/" \
    "${ECS_HOST_ALIAS}:${REMOTE_DOCKER_DIR}/"
}

main() {
  ensure_local_assets
  sync_assets
}

main "$@"
