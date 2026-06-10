#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROJECT_ROOT="/opt/insight-agent-platform"
readonly ENV_FILE="${PROJECT_ROOT}/env/ecs-preview.env"

tmpfile=""
backup_file=""
updated_any=0
declare -a updated_keys=()

log() {
  printf '[ecs-compose-images] %s\n' "$*"
}

die() {
  printf '[ecs-compose-images] ERROR: %s\n' "$*" >&2
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

ensure_env_file() {
  [[ -f "${ENV_FILE}" ]] || die "Missing env file: ${ENV_FILE}"
}

backup_env_file() {
  local timestamp

  timestamp="$(date +%Y%m%d-%H%M%S)"
  backup_file="${ENV_FILE}.${timestamp}.bak"
  cp "${ENV_FILE}" "${backup_file}"
  log "Backed up env file to ${backup_file}."
}

upsert_env_key() {
  local key="$1"
  local value="$2"

  awk -v key="${key}" -v value="${value}" '
    $0 ~ ("^" key "=") {
      if (updated == 0) {
        print key "=" value
        updated = 1
      }
      next
    }
    { print }
    END {
      if (updated == 0) {
        print key "=" value
      }
    }
  ' "${tmpfile}" > "${tmpfile}.next"

  mv "${tmpfile}.next" "${tmpfile}"
  updated_any=1
  updated_keys+=("${key}")
}

apply_updates() {
  tmpfile="$(mktemp)"
  cp "${ENV_FILE}" "${tmpfile}"

  if [[ -n "${MYSQL_IMAGE+x}" ]]; then
    upsert_env_key "MYSQL_IMAGE" "${MYSQL_IMAGE}"
  fi

  if [[ -n "${REDIS_IMAGE+x}" ]]; then
    upsert_env_key "REDIS_IMAGE" "${REDIS_IMAGE}"
  fi

  if [[ -n "${CADDY_IMAGE+x}" ]]; then
    upsert_env_key "CADDY_IMAGE" "${CADDY_IMAGE}"
  fi

  if ((updated_any == 0)); then
    log "No image variables were provided. Nothing changed."
    return
  fi

  install -m 0600 "${tmpfile}" "${ENV_FILE}"
  log "Updated image keys: ${updated_keys[*]}."
}

main() {
  require_deploy_user
  ensure_env_file
  backup_env_file
  apply_updates
}

trap cleanup_tmpfile EXIT
main "$@"
