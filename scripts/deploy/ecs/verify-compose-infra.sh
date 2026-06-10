#!/usr/bin/env bash
set -Eeuo pipefail

readonly COMPOSE_FILE="/opt/insight-agent-platform/deploy/docker/compose.ecs.preview.yml"
readonly ENV_FILE="/opt/insight-agent-platform/env/ecs-preview.env"
readonly SERVICES=(mysql redis caddy)

failures=0
running_services=""

log() {
  printf '[ecs-compose-verify] %s\n' "$*"
}

pass() {
  printf '[ecs-compose-verify] PASS: %s\n' "$*"
}

fail() {
  printf '[ecs-compose-verify] FAIL: %s\n' "$*" >&2
  failures=$((failures + 1))
}

die() {
  printf '[ecs-compose-verify] ERROR: %s\n' "$*" >&2
  exit 1
}

require_deploy_user() {
  local current_user
  current_user="$(id -un)"
  [[ "${current_user}" == "deploy" ]] || die "Run this script as the deploy user. Current user: ${current_user}."
}

require_docker_group_session() {
  if id -nG | tr ' ' '\n' | grep -qx docker; then
    pass "Current deploy shell has docker group membership."
  else
    fail "Current deploy shell does not have docker group membership."
  fi
}

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

check_required_files() {
  local missing=0

  if [[ -f "${COMPOSE_FILE}" ]]; then
    pass "compose file exists: ${COMPOSE_FILE}"
  else
    fail "Missing compose file: ${COMPOSE_FILE}"
    missing=1
  fi

  if [[ -f "${ENV_FILE}" ]]; then
    pass "env file exists: ${ENV_FILE}"
  else
    fail "Missing env file: ${ENV_FILE}"
    missing=1
  fi

  ((missing == 0))
}

load_env_file() {
  set -a
  # shellcheck disable=SC1090
  . "${ENV_FILE}"
  set +a
}

check_required_env_vars() {
  local missing=0
  local name
  local -a required_vars=(
    COMPOSE_PROJECT_NAME
    MYSQL_ROOT_PASSWORD
    MYSQL_PASSWORD
    MYSQL_DATABASE
    MYSQL_USER
    CADDY_SITE_ROOT
  )

  for name in "${required_vars[@]}"; do
    if [[ -n "${!name:-}" ]]; then
      pass "Env var is set: ${name}"
    else
      fail "Missing env var in ${ENV_FILE}: ${name}"
      missing=1
    fi
  done

  ((missing == 0))
}

collect_running_services() {
  if running_services="$(compose_cmd ps --status running --services 2>&1)"; then
    log "Running compose services:"
    if [[ -n "${running_services}" ]]; then
      printf '%s\n' "${running_services}" | sed 's/^/[ecs-compose-verify]   /'
    else
      log "  none"
    fi
  else
    fail "Unable to read running compose services: ${running_services}"
    running_services=""
  fi
}

check_service_running() {
  local service="$1"

  if printf '%s\n' "${running_services}" | grep -qx "${service}"; then
    pass "${service} container is running."
  else
    fail "${service} container is not running."
  fi
}

check_mysql_ping() {
  if compose_cmd exec -T mysql mysqladmin ping -h 127.0.0.1 -uroot "--password=${MYSQL_ROOT_PASSWORD}" --silent >/dev/null 2>&1; then
    pass "MySQL ping succeeded."
  else
    fail "MySQL ping failed."
  fi
}

check_mysql_localhost_bind() {
  local expected_port="${MYSQL_HOST_PORT:-3306}"
  local port_output
  local binding_count=0

  if port_output="$(compose_cmd port mysql 3306 2>&1)"; then
    while IFS= read -r binding; do
      [[ -n "${binding}" ]] || continue
      binding_count=$((binding_count + 1))

      if [[ "${binding}" == "127.0.0.1:${expected_port}" ]]; then
        continue
      fi

      fail "MySQL compose port binding must be 127.0.0.1:${expected_port}, got: ${binding}"
      return
    done <<< "${port_output}"
  else
    fail "Unable to inspect MySQL compose port binding: ${port_output}"
    return
  fi

  if ((binding_count == 0)); then
    fail "MySQL compose port binding is missing."
  else
    pass "MySQL compose port binding is localhost-only on 127.0.0.1:${expected_port}."
  fi
}

check_mysql_localhost_access() {
  local host_port="${MYSQL_HOST_PORT:-3306}"

  if timeout 3 bash -c "exec 3<>/dev/tcp/127.0.0.1/${host_port}" >/dev/null 2>&1; then
    pass "MySQL is reachable via ECS localhost 127.0.0.1:${host_port}."
  else
    fail "MySQL is not reachable via ECS localhost 127.0.0.1:${host_port}."
  fi
}

check_redis_ping() {
  local output

  if output="$(compose_cmd exec -T redis redis-cli ping 2>&1)" && [[ "${output}" == *PONG* ]]; then
    pass "Redis ping succeeded."
  else
    fail "Redis ping failed: ${output}"
  fi
}

check_caddy_health() {
  if curl --silent --show-error --fail http://127.0.0.1/health >/dev/null 2>&1; then
    pass "http://127.0.0.1/health is reachable."
  else
    fail "http://127.0.0.1/health is not reachable."
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

report_result() {
  if ((failures > 0)); then
    die "Compose infra verification finished with ${failures} failing check(s)."
  fi

  pass "Compose infra verification passed."
}

main() {
  local mysql_host_port

  require_deploy_user
  require_docker_group_session
  if ! check_required_files; then
    report_result
    return
  fi

  load_env_file
  mysql_host_port="${MYSQL_HOST_PORT:-3306}"
  if ! check_required_env_vars; then
    report_result
    return
  fi

  collect_running_services

  check_service_running mysql
  check_service_running redis
  check_service_running caddy
  check_mysql_ping
  check_mysql_localhost_bind
  check_mysql_localhost_access
  check_redis_ping
  check_caddy_health
  check_no_public_listener 3306
  if [[ "${mysql_host_port}" != "3306" ]]; then
    check_no_public_listener "${mysql_host_port}"
  fi
  check_no_public_listener 6379
  report_result
}

main "$@"
