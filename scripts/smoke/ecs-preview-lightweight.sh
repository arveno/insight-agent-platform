#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly AUTH_SMOKE_SCRIPT="${SCRIPT_DIR}/ecs-preview-auth.sh"

log() {
  printf '[ecs-preview-lightweight] %s\n' "$*"
}

die() {
  printf '[ecs-preview-lightweight] ERROR: %s\n' "$*" >&2
  exit 1
}

main() {
  [[ -f "${AUTH_SMOKE_SCRIPT}" ]] || die "Missing delegated auth smoke script: ${AUTH_SMOKE_SCRIPT}"

  log "Running preview-small lightweight smoke."
  log "This entry reuses curl/auth/session checks only."
  log "It does not run uv, pytest, runtime-result-delivery.py, provider model calls, or agent-worker."

  bash "${AUTH_SMOKE_SCRIPT}" "$@"
}

main "$@"
