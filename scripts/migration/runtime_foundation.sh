#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LOCAL_COMPOSE_FILE="${REPO_ROOT}/deploy/docker/compose.ecs.preview.yml"
readonly ECS_COMPOSE_FILE="/opt/insight-agent-platform/deploy/docker/compose.ecs.preview.yml"
readonly ECS_ENV_FILE="/opt/insight-agent-platform/env/ecs-preview.env"
readonly MIGRATION_DIR="${REPO_ROOT}/database/mysql/migrations"
readonly SEED_SQL="${REPO_ROOT}/database/mysql/seeds/004_analysis_runtime_foundation_seed.sql"
readonly VERIFY_SQL="${REPO_ROOT}/database/mysql/queries/004_analysis_runtime_foundation_verify.sql"
readonly EXPECTED_VERIFY_LINES=(
  "tables=5"
  "analysis_tasks.row_count=1"
  "conversations.row_count=1"
  "analysis_runs.row_count=1"
  "execution_attempts.row_count=0"
  "run_events.row_count=0"
  "analysisTaskId=analysis-task-revenue-gap-q2"
  "conversationId=conversation-revenue-gap-q2"
  "runId=analysis-q2-revenue-gap"
  "conversation.analysisTaskId=analysis-task-revenue-gap-q2"
  "conversation.currentRunId=analysis-q2-revenue-gap"
  "analysisRun.analysisTaskId=analysis-task-revenue-gap-q2"
  "analysisTask.businessDomainId=business-domain-revenue-quality"
  "analysisTask.contextPack.metricId=metric-recognized-revenue"
  "analysisTask.contextPack.tableIds=table-sales-order,table-refund-order"
  "analysisTask.contextPack.knowledgeDocumentIds=knowledge-document-channel-weekly-17,knowledge-document-inventory-east-04"
  "analysisRun.status=created"
  "analysisRun.phase=intake"
)

migration_target="${IAP_MIGRATION_TARGET:-ecs}"
ecs_host_alias="${IAP_MIGRATION_ECS_HOST_ALIAS:-iap-ecs}"
compose_project_name="${IAP_MIGRATION_COMPOSE_PROJECT_NAME:-iap-runtime-foundation-local}"
mysql_host_port="${IAP_MIGRATION_MYSQL_HOST_PORT:-}"
mysql_data_dir="${IAP_MIGRATION_DATA_DIR:-${REPO_ROOT}/.tmp/runtime-foundation/mysql}"
mysql_image="${MYSQL_IMAGE:-mysql:8}"
redis_image="${REDIS_IMAGE:-redis:7}"
caddy_image="${CADDY_IMAGE:-caddy:2}"
mysql_root_password="${IAP_MIGRATION_MYSQL_ROOT_PASSWORD:-iap_preview_root_password}"
mysql_password="${IAP_MIGRATION_MYSQL_PASSWORD:-iap_preview_password}"
mysql_database="${IAP_MIGRATION_MYSQL_DATABASE:-insight_agent_platform}"
mysql_user="${IAP_MIGRATION_MYSQL_USER:-iap_preview}"
caddy_site_root="${IAP_MIGRATION_CADDY_SITE_ROOT:-${REPO_ROOT}}"
runtime_tmp_dir="${TMPDIR:-/tmp}/insight-agent-platform/${compose_project_name}"
runtime_env_file="${runtime_tmp_dir}/runtime-foundation.env"
runtime_override_file="${runtime_tmp_dir}/runtime-foundation.override.yml"

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

require_supported_target() {
  case "${migration_target}" in
    ecs | local)
      ;;
    *)
      die "Unsupported IAP_MIGRATION_TARGET=${migration_target}. Expected ecs or local."
      ;;
  esac
}

pick_free_port() {
  python3 - <<'PY'
import socket

with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    print(sock.getsockname()[1])
PY
}

resolve_mysql_host_port() {
  if [[ -n "${mysql_host_port}" ]]; then
    printf '%s\n' "${mysql_host_port}"
    return 0
  fi

  pick_free_port
}

write_runtime_env() {
  mkdir -p "${runtime_tmp_dir}"
  local resolved_mysql_host_port
  resolved_mysql_host_port="$(resolve_mysql_host_port)"
  cat >"${runtime_env_file}" <<EOF
COMPOSE_PROJECT_NAME=${compose_project_name}
MYSQL_IMAGE=${mysql_image}
REDIS_IMAGE=${redis_image}
CADDY_IMAGE=${caddy_image}
MYSQL_HOST_PORT=${resolved_mysql_host_port}
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_PASSWORD=${mysql_password}
MYSQL_DATABASE=${mysql_database}
MYSQL_USER=${mysql_user}
CADDY_SITE_ROOT=${caddy_site_root}
EOF
}

write_runtime_override() {
  mkdir -p "${mysql_data_dir}"
  cat >"${runtime_override_file}" <<EOF
services:
  mysql:
    volumes:
      - ${mysql_data_dir}:/var/lib/mysql
EOF
}

local_compose_cmd() {
  docker compose \
    --env-file "${runtime_env_file}" \
    -f "${LOCAL_COMPOSE_FILE}" \
    -f "${runtime_override_file}" \
    "$@"
}

ecs_compose_cmd() {
  local remote_command
  printf -v remote_command '%q ' docker compose --env-file "${ECS_ENV_FILE}" -f "${ECS_COMPOSE_FILE}" "$@"
  ssh "${ecs_host_alias}" "${remote_command}"
}

ensure_local_mysql_up() {
  write_runtime_env
  write_runtime_override
  local_compose_cmd up -d mysql >/dev/null

  for _ in $(seq 1 30); do
    if local_compose_cmd exec -T mysql sh -lc \
      'exec mysqladmin ping -h 127.0.0.1 -uroot "--password=${MYSQL_ROOT_PASSWORD}" --silent' \
      >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  die "Local MySQL container did not become ready in time."
}

ensure_ecs_mysql_up() {
  ecs_compose_cmd up -d mysql >/dev/null

  for _ in $(seq 1 30); do
    if ecs_compose_cmd exec -T mysql sh -lc \
      'exec mysqladmin ping -h 127.0.0.1 -uroot "--password=${MYSQL_ROOT_PASSWORD}" --silent' \
      >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  die "ECS preview MySQL container did not become ready in time."
}

ensure_mysql_up() {
  case "${migration_target}" in
    ecs)
      ensure_ecs_mysql_up
      ;;
    local)
      ensure_local_mysql_up
      ;;
  esac
}

exec_sql_stdin() {
  local sql
  sql="$(cat)"
  ensure_mysql_up

  case "${migration_target}" in
    ecs)
      ecs_compose_cmd exec -T -e IAP_RUNTIME_SQL="${sql}" mysql sh -lc \
        'exec mysql --default-character-set=utf8mb4 -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" -e "$IAP_RUNTIME_SQL"'
      ;;
    local)
      local_compose_cmd exec -T -e IAP_RUNTIME_SQL="${sql}" mysql sh -lc \
        'exec mysql --default-character-set=utf8mb4 -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" -e "$IAP_RUNTIME_SQL"'
      ;;
  esac
}

query_json_stdin() {
  local sql
  sql="$(cat)"
  ensure_mysql_up

  case "${migration_target}" in
    ecs)
      ecs_compose_cmd exec -T -e IAP_RUNTIME_SQL="${sql}" mysql sh -lc \
        'exec mysql --default-character-set=utf8mb4 --batch --raw --skip-column-names -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" -e "$IAP_RUNTIME_SQL"'
      ;;
    local)
      local_compose_cmd exec -T -e IAP_RUNTIME_SQL="${sql}" mysql sh -lc \
        'exec mysql --default-character-set=utf8mb4 --batch --raw --skip-column-names -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" -e "$IAP_RUNTIME_SQL"'
      ;;
  esac
}

run_file() {
  local sql_file="$1"
  ensure_mysql_up

  case "${migration_target}" in
    ecs)
      ecs_compose_cmd exec -T mysql sh -lc \
        'exec mysql --default-character-set=utf8mb4 -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"' \
        <"${sql_file}"
      ;;
    local)
      local_compose_cmd exec -T mysql sh -lc \
        'exec mysql --default-character-set=utf8mb4 -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"' \
        <"${sql_file}"
      ;;
  esac
}

run_migrations() {
  local migration_files=()
  local sql_file
  local old_ifs="${IFS}"

  IFS=$'\n' migration_files=($(find "${MIGRATION_DIR}" -maxdepth 1 -type f -name '*.sql' | sort))
  IFS="${old_ifs}"

  for sql_file in "${migration_files[@]}"; do
    run_file "${sql_file}"
  done
}

run_verify() {
  ensure_mysql_up
  local verify_output

  case "${migration_target}" in
    ecs)
      verify_output="$(
        ecs_compose_cmd exec -T mysql sh -lc \
          'exec mysql --default-character-set=utf8mb4 --batch --raw --skip-column-names -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"' \
          <"${VERIFY_SQL}"
      )"
      ;;
    local)
      verify_output="$(
        local_compose_cmd exec -T mysql sh -lc \
          'exec mysql --default-character-set=utf8mb4 --batch --raw --skip-column-names -uroot "--password=${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"' \
          <"${VERIFY_SQL}"
      )"
      ;;
  esac

  printf '%s\n' "${verify_output}"

  local expected_line
  local missing_line=0
  for expected_line in "${EXPECTED_VERIFY_LINES[@]}"; do
    if ! grep -Fqx -- "${expected_line}" <<<"${verify_output}"; then
      printf 'Missing expected query verify line: %s\n' "${expected_line}" >&2
      missing_line=1
    fi
  done

  if [[ "${missing_line}" -ne 0 ]]; then
    return 1
  fi
}

tear_down() {
  if [[ "${migration_target}" != "local" ]]; then
    die "The down command is only allowed with IAP_MIGRATION_TARGET=local."
  fi

  write_runtime_env
  write_runtime_override
  local_compose_cmd down --remove-orphans >/dev/null
}

main() {
  local command="${1:-}"

  require_supported_target

  case "${command}" in
    migrate)
      run_migrations
      ;;
    seed)
      run_file "${SEED_SQL}"
      ;;
    query-verify)
      run_verify
      ;;
    exec-sql)
      exec_sql_stdin
      ;;
    query-json)
      query_json_stdin
      ;;
    down)
      tear_down
      ;;
    *)
      echo "Usage: $0 {migrate|seed|query-verify|exec-sql|query-json|down}" >&2
      exit 1
      ;;
  esac
}

main "$@"
