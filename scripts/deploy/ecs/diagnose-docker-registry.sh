#!/usr/bin/env bash
set -Eeuo pipefail

readonly DOCKER_DAEMON_JSON_FILE="${DOCKER_DAEMON_JSON_FILE:-/etc/docker/daemon.json}"
readonly REGISTRY_URL="https://registry-1.docker.io/v2/"
readonly AUTH_URL="https://auth.docker.io/"

failures=0
pull_hello_world=0
effective_registry_mirror_configured=0

log() {
  printf '[ecs-registry-diagnose] %s\n' "$*"
}

pass() {
  printf '[ecs-registry-diagnose] PASS: %s\n' "$*"
}

warn() {
  printf '[ecs-registry-diagnose] WARN: %s\n' "$*" >&2
}

fail() {
  printf '[ecs-registry-diagnose] FAIL: %s\n' "$*" >&2
  failures=$((failures + 1))
}

die() {
  printf '[ecs-registry-diagnose] ERROR: %s\n' "$*" >&2
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

  if (($# == 1)) && [[ "$1" == "--pull-hello-world" ]]; then
    pull_hello_world=1
    return
  fi

  die "Unknown arguments. Usage: bash scripts/deploy/ecs/diagnose-docker-registry.sh [--pull-hello-world]"
}

check_docker_service() {
  local active_state

  active_state="$(systemctl is-active docker 2>&1 || true)"
  log "docker service active state: ${active_state}"

  if [[ "${active_state}" == "active" ]]; then
    pass "docker service is active."
  else
    fail "docker service is not active."
  fi
}

print_docker_versions() {
  local docker_version compose_version

  if docker_version="$(docker version --format 'client={{.Client.Version}} server={{.Server.Version}}' 2>&1)"; then
    log "Docker version: ${docker_version}"
    pass "Docker Engine version is available."
  else
    fail "Docker version check failed: ${docker_version}"
  fi

  if compose_version="$(docker compose version 2>&1)"; then
    log "Docker Compose version: ${compose_version}"
    pass "Docker Compose version is available."
  else
    fail "Docker Compose version check failed: ${compose_version}"
  fi
}

print_registry_mirror_config() {
  local file_mirrors effective_mirrors

  if [[ -r "${DOCKER_DAEMON_JSON_FILE}" ]]; then
    if file_mirrors="$(jq -c '."registry-mirrors" // []' "${DOCKER_DAEMON_JSON_FILE}" 2>&1)"; then
      log "daemon.json registry-mirrors: ${file_mirrors}"
      pass "daemon.json registry mirror configuration is readable."
    else
      fail "Failed to parse ${DOCKER_DAEMON_JSON_FILE}: ${file_mirrors}"
    fi
  else
    log "daemon.json registry-mirrors: [] (${DOCKER_DAEMON_JSON_FILE} not present or not readable)"
  fi

  if effective_mirrors="$(docker info --format '{{json .RegistryConfig.Mirrors}}' 2>&1)"; then
    log "effective Docker registry mirrors: ${effective_mirrors}"
    pass "Effective Docker registry mirror configuration is readable."

    if [[ "${effective_mirrors}" != "[]" && "${effective_mirrors}" != "null" ]]; then
      effective_registry_mirror_configured=1
      pass "Registry mirror is configured in the active Docker daemon."
    else
      log "Registry mirror configured status: none"
    fi
  else
    fail "Failed to read effective Docker registry mirror configuration: ${effective_mirrors}"
  fi
}

check_dns_resolution() {
  local host="$1"
  local dns_output

  if dns_output="$(getent ahosts "${host}" 2>&1)" && [[ -n "${dns_output}" ]]; then
    log "DNS resolution for ${host}:"
    printf '%s\n' "${dns_output}" | sed 's/^/[ecs-registry-diagnose]   /'
    pass "DNS resolution succeeded for ${host}."
  else
    fail "DNS resolution failed for ${host}: ${dns_output}"
  fi
}

check_https_endpoint() {
  local name="$1"
  local url="$2"
  local http_code

  if http_code="$(
    curl \
      --silent \
      --show-error \
      --location \
      --output /dev/null \
      --write-out '%{http_code}' \
      --connect-timeout 5 \
      --max-time 20 \
      "${url}" 2>&1
  )"; then
    log "${name}: HTTP ${http_code} from ${url}"
    pass "${name} is reachable."
    return 0
  else
    warn "${name} direct connectivity check failed for ${url}: ${http_code}"
    return 1
  fi
}

check_direct_docker_hub_connectivity() {
  local direct_failures=0

  if ! check_https_endpoint "Docker Hub registry API" "${REGISTRY_URL}"; then
    direct_failures=$((direct_failures + 1))
  fi

  if ! check_https_endpoint "Docker Hub auth service" "${AUTH_URL}"; then
    direct_failures=$((direct_failures + 1))
  fi

  if ((direct_failures == 0)); then
    pass "Direct Docker Hub HTTPS connectivity is available."
    return
  fi

  if ((effective_registry_mirror_configured == 1)); then
    warn "Docker Hub direct HTTPS failed, but registry mirror is configured; continue to image pull validation."
    return
  fi

  fail "Docker Hub direct HTTPS failed for ${direct_failures} endpoint(s) and no effective registry mirror is configured."
}

maybe_pull_hello_world() {
  local output

  if ((pull_hello_world == 0)); then
    log "Image pull status: not tested. Use --pull-hello-world to test Docker image pull capability explicitly."
    return
  fi

  if output="$(docker pull hello-world 2>&1)"; then
    log "docker pull hello-world output:"
    printf '%s\n' "${output}" | sed 's/^/[ecs-registry-diagnose]   /'
    pass "Docker image pull capability verified with hello-world."
  else
    fail "Docker image pull capability check failed: ${output}"
  fi
}

report_result() {
  if ((failures > 0)); then
    die "Registry diagnostics finished with ${failures} failing check(s)."
  fi

  pass "Docker registry diagnostics passed."
}

main() {
  parse_args "$@"
  require_deploy_user
  check_docker_service
  print_docker_versions
  print_registry_mirror_config
  check_dns_resolution "registry-1.docker.io"
  check_dns_resolution "auth.docker.io"
  check_direct_docker_hub_connectivity
  maybe_pull_hello_world
  report_result
}

main "$@"
