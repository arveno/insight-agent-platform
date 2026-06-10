#!/usr/bin/env bash
set -Eeuo pipefail

readonly DOCKER_DAEMON_JSON_FILE="${DOCKER_DAEMON_JSON_FILE:-/etc/docker/daemon.json}"
tmpdir=""

log() {
  printf '[ecs-registry-configure] %s\n' "$*"
}

die() {
  printf '[ecs-registry-configure] ERROR: %s\n' "$*" >&2
  exit 1
}

cleanup_tmpdir() {
  if [[ -n "${tmpdir:-}" ]]; then
    rm -rf "${tmpdir}"
  fi
}

require_deploy_user() {
  local current_user
  current_user="$(id -un)"
  [[ "${current_user}" == "deploy" ]] || die "Run this script as the deploy user. Current user: ${current_user}."
}

require_sudo() {
  sudo -n true >/dev/null 2>&1 || die "Passwordless sudo is required for the deploy user."
}

require_registry_mirror() {
  [[ -n "${DOCKER_REGISTRY_MIRROR:-}" ]] || die "DOCKER_REGISTRY_MIRROR is required. Example: DOCKER_REGISTRY_MIRROR=\"https://example-mirror\" bash scripts/deploy/ecs/configure-docker-registry.sh"
}

backup_and_capture_current_config() {
  local backup_file="$1"
  local current_config_file="$2"

  if sudo test -f "${DOCKER_DAEMON_JSON_FILE}"; then
    log "Backing up ${DOCKER_DAEMON_JSON_FILE} to ${backup_file}."
    sudo cp "${DOCKER_DAEMON_JSON_FILE}" "${backup_file}"
    sudo cat "${DOCKER_DAEMON_JSON_FILE}" >"${current_config_file}"
    return
  fi

  log "${DOCKER_DAEMON_JSON_FILE} does not exist; creating baseline backup at ${backup_file}."
  printf '{}\n' >"${current_config_file}"
  printf '{}\n' | sudo tee "${backup_file}" >/dev/null
}

render_new_config() {
  local current_config_file="$1"
  local rendered_config_file="$2"

  jq \
    --arg mirror "${DOCKER_REGISTRY_MIRROR}" \
    '. + {"registry-mirrors": [$mirror]}' \
    "${current_config_file}" >"${rendered_config_file}" || die "Failed to render updated Docker daemon.json with jq."
}

write_new_config() {
  local rendered_config_file="$1"

  sudo install -d -m 0755 "$(dirname "${DOCKER_DAEMON_JSON_FILE}")"
  sudo install -m 0644 "${rendered_config_file}" "${DOCKER_DAEMON_JSON_FILE}"
  log "Wrote ${DOCKER_DAEMON_JSON_FILE} with registry mirror ${DOCKER_REGISTRY_MIRROR}."
}

restart_docker() {
  log "Restarting Docker."
  sudo systemctl restart docker
}

verify_docker_restart() {
  local active_state effective_mirrors

  active_state="$(systemctl is-active docker 2>&1 || true)"
  log "docker service active state: ${active_state}"
  [[ "${active_state}" == "active" ]] || die "Docker is not active after restart."

  docker info >/dev/null 2>&1 || die "docker info failed after restarting Docker."

  if effective_mirrors="$(docker info --format '{{json .RegistryConfig.Mirrors}}' 2>&1)"; then
    log "effective Docker registry mirrors: ${effective_mirrors}"
  else
    die "Failed to read effective Docker registry mirrors after restart: ${effective_mirrors}"
  fi
}

print_next_steps() {
  cat <<'EOF'

[ecs-registry-configure] Mirror configuration finished.
[ecs-registry-configure] Next steps:
[ecs-registry-configure] 1. Run bash scripts/deploy/ecs/diagnose-docker-registry.sh --pull-hello-world
[ecs-registry-configure] 2. Or run bash scripts/deploy/ecs/verify-bootstrap.sh --hello-world
[ecs-registry-configure] This step only standardizes Docker image pull capability. It does not deploy business containers.
EOF
}

main() {
  local backup_file current_config_file rendered_config_file timestamp

  require_deploy_user
  require_sudo
  require_registry_mirror

  tmpdir="$(mktemp -d)"

  timestamp="$(date +%Y%m%d%H%M%S)"
  backup_file="${DOCKER_DAEMON_JSON_FILE}.bak.${timestamp}"
  current_config_file="${tmpdir}/daemon.current.json"
  rendered_config_file="${tmpdir}/daemon.rendered.json"

  backup_and_capture_current_config "${backup_file}" "${current_config_file}"
  render_new_config "${current_config_file}" "${rendered_config_file}"
  write_new_config "${rendered_config_file}"
  restart_docker
  verify_docker_restart
  print_next_steps
}

trap cleanup_tmpdir EXIT
main "$@"
