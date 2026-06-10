#!/usr/bin/env bash
set -Eeuo pipefail

readonly DOCKER_DAEMON_JSON_FILE="${DOCKER_DAEMON_JSON_FILE:-/etc/docker/daemon.json}"
readonly REGISTRY_URL="https://registry-1.docker.io/v2/"
readonly AUTH_URL="https://auth.docker.io/"

failures=0
pull_hello_world=0

log() {
  printf '[ecs-registry-diagnose] %s\n' "$*"
}

pass() {
  printf '[ecs-registry-diagnose] PASS: %s\n' "$*"
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
  else
    fail "${name} check failed for ${url}: ${http_code}"
  fi
}

maybe_pull_hello_world() {
  local output

  if ((pull_hello_world == 0)); then
    log "Skipping hello-world pull. Use --pull-hello-world to test Docker image pull capability explicitly."
    return
  fi

  if output="$(docker pull hello-world 2>&1)"; then
    log "docker pull hello-world output:"
    printf '%s\n' "${output}" | sed 's/^/[ecs-registry-diagnose]   /'
    pass "docker pull hello-world succeeded."
  else
    fail "docker pull hello-world failed: ${output}"
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
  check_https_endpoint "Docker Hub registry API" "${REGISTRY_URL}"
  check_https_endpoint "Docker Hub auth service" "${AUTH_URL}"
  maybe_pull_hello_world
  report_result
}

main "$@"
