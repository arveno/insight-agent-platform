#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROJECT_ROOT="/opt/insight-agent-platform"
readonly ENV_DIR="${PROJECT_ROOT}/env"
readonly ENV_FILE="${ENV_DIR}/ecs-preview.env"
readonly DEFAULT_MYSQL_IMAGE="mysql:8"
readonly DEFAULT_REDIS_IMAGE="redis:7"
readonly DEFAULT_CADDY_IMAGE="caddy:2"
readonly DEFAULT_AGENT_RUNTIME_BUILD_CONTEXT="/opt/insight-agent-platform/repo"
readonly DEFAULT_AGENT_RUNTIME_DOCKERFILE="deploy/docker/agent-runtime/Dockerfile"
readonly DEFAULT_AGENT_RUNTIME_HOST_PORT="8000"
readonly DEFAULT_AGENT_RUNTIME_PYPI_INDEX_URL="https://mirrors.aliyun.com/pypi/simple/"

force_overwrite=0
tmpfile=""

log() {
  printf '[ecs-compose-env] %s\n' "$*"
}

die() {
  printf '[ecs-compose-env] ERROR: %s\n' "$*" >&2
  exit 1
}

cleanup_tmpfile() {
  if [[ -n "${tmpfile:-}" ]]; then
    rm -f "${tmpfile}"
  fi
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

  if (($# == 1)) && [[ "$1" == "--force" ]]; then
    force_overwrite=1
    return
  fi

  die "Unknown arguments. Usage: bash scripts/deploy/ecs/init-compose-env.sh [--force]"
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
    return
  fi

  od -An -tx1 -N24 /dev/urandom | tr -d ' \n'
}

ensure_project_root() {
  [[ -d "${PROJECT_ROOT}" ]] || die "Missing ${PROJECT_ROOT}. Run bootstrap.sh first."
}

write_env_file() {
  local mysql_root_password mysql_password
  local mysql_image redis_image caddy_image

  mysql_root_password="$(generate_secret)"
  mysql_password="$(generate_secret)"
  mysql_image="${MYSQL_IMAGE:-${DEFAULT_MYSQL_IMAGE}}"
  redis_image="${REDIS_IMAGE:-${DEFAULT_REDIS_IMAGE}}"
  caddy_image="${CADDY_IMAGE:-${DEFAULT_CADDY_IMAGE}}"
  tmpfile="$(mktemp)"

  cat >"${tmpfile}" <<EOF
COMPOSE_PROJECT_NAME=iap-ecs-preview
MYSQL_IMAGE=${mysql_image}
REDIS_IMAGE=${redis_image}
CADDY_IMAGE=${caddy_image}
AGENT_RUNTIME_BUILD_CONTEXT=${AGENT_RUNTIME_BUILD_CONTEXT:-${DEFAULT_AGENT_RUNTIME_BUILD_CONTEXT}}
AGENT_RUNTIME_DOCKERFILE=${AGENT_RUNTIME_DOCKERFILE:-${DEFAULT_AGENT_RUNTIME_DOCKERFILE}}
AGENT_RUNTIME_HOST_PORT=${AGENT_RUNTIME_HOST_PORT:-${DEFAULT_AGENT_RUNTIME_HOST_PORT}}
AGENT_RUNTIME_PYPI_INDEX_URL=${AGENT_RUNTIME_PYPI_INDEX_URL:-${DEFAULT_AGENT_RUNTIME_PYPI_INDEX_URL}}
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_PASSWORD=${mysql_password}
MYSQL_DATABASE=insight_agent_platform
MYSQL_USER=iap_preview
APP_ENV=preview
AUTH_SESSION_COOKIE_SECURE=false
AUTH_SESSION_COOKIE_SAMESITE=lax
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
CADDY_SITE_ROOT=/opt/insight-agent-platform/shared/frontend
EOF

  install -d -m 0755 "${ENV_DIR}"
  install -m 0600 "${tmpfile}" "${ENV_FILE}"
}

main() {
  parse_args "$@"
  require_deploy_user
  ensure_project_root

  if [[ -f "${ENV_FILE}" ]] && ((force_overwrite == 0)); then
    log "Env file already exists at ${ENV_FILE}. Use --force to overwrite."
    return
  fi

  write_env_file
  log "Env file is ready at ${ENV_FILE}."
}

trap cleanup_tmpfile EXIT
main "$@"
