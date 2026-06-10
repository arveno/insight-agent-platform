#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROJECT_ROOT="/opt/insight-agent-platform"
readonly ENV_DIR="${PROJECT_ROOT}/env"
readonly ENV_FILE="${ENV_DIR}/ecs-preview.env"

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

  mysql_root_password="$(generate_secret)"
  mysql_password="$(generate_secret)"
  tmpfile="$(mktemp)"

  cat >"${tmpfile}" <<EOF
COMPOSE_PROJECT_NAME=iap-ecs-preview
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_PASSWORD=${mysql_password}
MYSQL_DATABASE=insight_agent_platform
MYSQL_USER=iap_preview
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
