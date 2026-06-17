#!/usr/bin/env bash
set -Eeuo pipefail

readonly MIN_AVAILABLE_MEMORY_MIB=600
readonly MAX_LOAD_AVERAGE_1MIN=2.0
readonly MIN_ROOT_AVAILABLE_KIB=$((5 * 1024 * 1024))

failures=0

log() {
  printf '[preview-small-capacity] %s\n' "$*"
}

pass() {
  printf '[preview-small-capacity] PASS: %s\n' "$*"
}

fail() {
  printf '[preview-small-capacity] FAIL: %s\n' "$*" >&2
  failures=$((failures + 1))
}

die() {
  printf '[preview-small-capacity] ERROR: %s\n' "$*" >&2
  exit 1
}

check_available_memory() {
  local mem_available_kib mem_available_mib
  mem_available_kib="$(awk '/MemAvailable:/ {print $2; exit}' /proc/meminfo)"
  [[ -n "${mem_available_kib}" ]] || die "Unable to read MemAvailable from /proc/meminfo."
  mem_available_mib=$((mem_available_kib / 1024))

  if ((mem_available_mib < MIN_AVAILABLE_MEMORY_MIB)); then
    fail "available memory ${mem_available_mib}Mi is below ${MIN_AVAILABLE_MEMORY_MIB}Mi"
  else
    pass "available memory ${mem_available_mib}Mi"
  fi
}

check_load_average() {
  local load_1m
  load_1m="$(awk '{print $1; exit}' /proc/loadavg)"
  [[ -n "${load_1m}" ]] || die "Unable to read /proc/loadavg."

  if awk -v value="${load_1m}" -v max="${MAX_LOAD_AVERAGE_1MIN}" 'BEGIN { exit !(value <= max) }'; then
    pass "load average 1min ${load_1m}"
  else
    fail "load average 1min ${load_1m} exceeds ${MAX_LOAD_AVERAGE_1MIN}"
  fi
}

check_root_disk_available() {
  local root_available_kib root_available_gib
  root_available_kib="$(df -Pk / | awk 'NR==2 {print $4}')"
  [[ -n "${root_available_kib}" ]] || die "Unable to read root filesystem availability via df."
  root_available_gib="$(awk -v kib="${root_available_kib}" 'BEGIN { printf "%.2f", kib / 1024 / 1024 }')"

  if ((root_available_kib < MIN_ROOT_AVAILABLE_KIB)); then
    fail "root disk available ${root_available_gib}Gi is below 5.00Gi"
  else
    pass "root disk available ${root_available_gib}Gi"
  fi
}

check_swap_status() {
  local swap_total_kib swap_free_kib
  swap_total_kib="$(awk '/SwapTotal:/ {print $2; exit}' /proc/meminfo)"
  swap_free_kib="$(awk '/SwapFree:/ {print $2; exit}' /proc/meminfo)"
  [[ -n "${swap_total_kib}" && -n "${swap_free_kib}" ]] || die "Unable to read swap status from /proc/meminfo."

  if ((swap_total_kib == 0)); then
    pass "swap status disabled"
    return 0
  fi

  pass "swap status total=$((swap_total_kib / 1024))Mi free=$((swap_free_kib / 1024))Mi"
}

main() {
  check_available_memory
  check_load_average
  check_root_disk_available
  check_swap_status

  if ((failures > 0)); then
    exit 1
  fi

  log "preview-small capacity preflight passed."
}

main "$@"
