#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROJECT_DIRS=(
  "/opt/insight-agent-platform"
  "/opt/insight-agent-platform/releases"
  "/opt/insight-agent-platform/current"
  "/opt/insight-agent-platform/shared"
  "/opt/insight-agent-platform/shared/env"
  "/opt/insight-agent-platform/shared/logs"
  "/opt/insight-agent-platform/shared/backups"
  "/opt/insight-agent-platform/shared/data"
  "/opt/insight-agent-platform/shared/data/mysql"
  "/opt/insight-agent-platform/shared/data/redis"
  "/opt/insight-agent-platform/shared/data/milvus-lite"
  "/opt/insight-agent-platform/shared/frontend"
)

failures=0
run_hello_world=0

log() {
  printf '[ecs-verify] %s\n' "$*"
}

fail() {
  printf '[ecs-verify] FAIL: %s\n' "$*" >&2
  failures=$((failures + 1))
}

pass() {
  printf '[ecs-verify] PASS: %s\n' "$*"
}

die() {
  printf '[ecs-verify] ERROR: %s\n' "$*" >&2
  exit 1
}

require_deploy_user() {
  local current_user
  current_user="$(id -un)"
  [[ "${current_user}" == "deploy" ]] || die "Run this script as the deploy user. Current user: ${current_user}."
}

parse_args() {
  if (($# == 0)); then
    return
  fi

  if (($# == 1)) && [[ "$1" == "--hello-world" ]]; then
    run_hello_world=1
    return
  fi

  die "Unknown arguments. Usage: bash scripts/deploy/ecs/verify-bootstrap.sh [--hello-world]"
}

print_host_summary() {
  local pretty_name cpu_count mem_summary disk_summary

  # shellcheck disable=SC1091
  . /etc/os-release
  pretty_name="${PRETTY_NAME:-unknown}"
  cpu_count="$(nproc)"
  mem_summary="$(free -h | awk '/^Mem:/ {print $2 " total, " $7 " available"}')"
  disk_summary="$(df -h / | awk 'NR==2 {print $2 " total, " $3 " used, " $4 " available on " $6}')"

  log "OS: ${pretty_name}"
  log "CPU: ${cpu_count} vCPU"
  log "Memory: ${mem_summary}"
  log "Disk: ${disk_summary}"

  case "${ID:-}" in
    ubuntu)
      if [[ "${VERSION_ID:-}" == "24.04" ]]; then
        pass "Detected Ubuntu 24.04."
      else
        fail "Expected Ubuntu 24.04 for the reviewed ECS target, detected ${pretty_name}."
      fi
      ;;
    debian)
      pass "Detected Debian apt environment."
      ;;
    *)
      fail "Unsupported OS for this bootstrap flow: ${pretty_name}."
      ;;
  esac
}

print_swap_status() {
  local swap_summary

  swap_summary="$(swapon --show --bytes --noheadings --output=NAME,SIZE,USED,PRIO 2>/dev/null || true)"
  if [[ -n "${swap_summary}" ]]; then
    log "Swap:"
    printf '%s\n' "${swap_summary}" | sed 's/^/[ecs-verify]   /'
    pass "Swap is active."
  else
    fail "No active swap detected."
  fi
}

check_docker_group_session() {
  if id -nG | tr ' ' '\n' | grep -qx docker; then
    pass "Current deploy shell has docker group membership."
  else
    fail "Current deploy shell does not have docker group membership. Reconnect over SSH and re-run verification."
  fi
}

check_docker_versions() {
  local docker_version compose_version

  if docker_version="$(docker version --format 'client={{.Client.Version}} server={{.Server.Version}}' 2>&1)"; then
    log "Docker version: ${docker_version}"
    pass "Docker Engine is available."
  else
    fail "Docker version check failed: ${docker_version}"
  fi

  if compose_version="$(docker compose version 2>&1)"; then
    log "Docker Compose version: ${compose_version}"
    pass "Docker Compose plugin is available."
  else
    fail "Docker Compose version check failed: ${compose_version}"
  fi
}

check_docker_service() {
  local enabled_state active_state

  enabled_state="$(systemctl is-enabled docker 2>&1 || true)"
  active_state="$(systemctl is-active docker 2>&1 || true)"

  log "docker service enabled state: ${enabled_state}"
  log "docker service active state: ${active_state}"

  [[ "${enabled_state}" == "enabled" ]] || fail "docker service is not enabled."
  [[ "${active_state}" == "active" ]] || fail "docker service is not active."

  if [[ "${enabled_state}" == "enabled" && "${active_state}" == "active" ]]; then
    pass "docker service is enabled and active."
  fi
}

check_project_directories() {
  local path owner

  for path in "${PROJECT_DIRS[@]}"; do
    if [[ ! -d "${path}" ]]; then
      fail "Missing project path: ${path}"
      continue
    fi

    owner="$(stat -c '%U:%G' "${path}")"
    if [[ "${owner}" == "deploy:deploy" ]]; then
      pass "Path ready: ${path} (${owner})"
    else
      fail "Unexpected owner for ${path}: ${owner}"
    fi
  done
}

print_listening_ports() {
  local listeners

  listeners="$(ss -ltnH 2>/dev/null | awk '{print $4}' | sort -u || true)"
  log "Listening TCP ports:"
  if [[ -n "${listeners}" ]]; then
    printf '%s\n' "${listeners}" | sed 's/^/[ecs-verify]   /'
  else
    log "  none"
  fi
}

is_loopback_host() {
  case "$1" in
    127.0.0.1|::1|::ffff:127.0.0.1|localhost)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

check_no_public_listener() {
  local port="$1"
  local address host
  local -a public_addresses=()

  while IFS= read -r address; do
    [[ -n "${address}" ]] || continue
    host="${address%:*}"
    host="${host#[}"
    host="${host%]}"

    if ! is_loopback_host "${host}"; then
      public_addresses+=("${address}")
    fi
  done < <(ss -ltnH 2>/dev/null | awk -v port=":${port}" '$4 ~ port"$" {print $4}')

  if ((${#public_addresses[@]} == 0)); then
    pass "Port ${port} is not listening on a non-loopback interface."
  else
    fail "Port ${port} is exposed on: ${public_addresses[*]}"
  fi
}

maybe_run_hello_world() {
  local output

  if ((run_hello_world == 0)); then
    log "Skipping docker hello-world check. Use --hello-world to run it explicitly."
    return
  fi

  if output="$(docker run --rm hello-world 2>&1)"; then
    pass "docker run --rm hello-world succeeded."
  else
    fail "docker run --rm hello-world failed: ${output}"
  fi
}

report_result() {
  if ((failures > 0)); then
    die "Verification finished with ${failures} failing check(s)."
  fi

  pass "Bootstrap verification passed."
}

main() {
  parse_args "$@"
  require_deploy_user
  print_host_summary
  print_swap_status
  check_docker_group_session
  check_docker_versions
  check_docker_service
  check_project_directories
  print_listening_ports
  check_no_public_listener 3306
  check_no_public_listener 6379
  check_no_public_listener 8000
  maybe_run_hello_world
  report_result
}

main "$@"
