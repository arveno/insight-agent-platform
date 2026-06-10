#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROJECT_ROOT="/opt/insight-agent-platform"
readonly SWAP_FILE="/swapfile"
readonly SWAP_SIZE_GB=2
readonly BASE_PACKAGES=(
  ca-certificates
  curl
  gnupg
  lsb-release
  git
  jq
  rsync
  unzip
)
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

log() {
  printf '[ecs-bootstrap] %s\n' "$*"
}

die() {
  printf '[ecs-bootstrap] ERROR: %s\n' "$*" >&2
  exit 1
}

require_deploy_user() {
  local current_user
  current_user="$(id -un)"
  [[ "$current_user" == "deploy" ]] || die "Run this script as the deploy user. Current user: ${current_user}."
}

require_sudo() {
  sudo -n true >/dev/null 2>&1 || die "Passwordless sudo is required for the deploy user."
}

load_os_release() {
  [[ -r /etc/os-release ]] || die "Missing /etc/os-release; cannot identify the operating system."

  # shellcheck disable=SC1091
  . /etc/os-release

  readonly OS_ID="$ID"
  readonly OS_VERSION_ID="${VERSION_ID:-}"
  readonly OS_PRETTY_NAME="${PRETTY_NAME:-$ID}"
  readonly OS_CODENAME="${VERSION_CODENAME:-${UBUNTU_CODENAME:-}}"
}

require_supported_environment() {
  command -v apt-get >/dev/null 2>&1 || die "This bootstrap only supports Debian-like systems with apt-get."
  command -v systemctl >/dev/null 2>&1 || die "systemctl is required for Docker service management."
  [[ -n "${OS_CODENAME}" ]] || die "Unable to determine the OS codename from /etc/os-release."

  case "${OS_ID}" in
    ubuntu)
      [[ "${OS_VERSION_ID}" == "24.04" ]] || die "This bootstrap is reviewed for Ubuntu 24.04. Detected ${OS_PRETTY_NAME}."
      ;;
    debian)
      ;;
    *)
      die "Unsupported OS: ${OS_PRETTY_NAME}. Only Ubuntu 24.04 or Debian apt environments are supported."
      ;;
  esac
}

install_base_packages() {
  log "Installing base packages."
  sudo apt-get update
  sudo apt-get install -y "${BASE_PACKAGES[@]}"
}

ensure_project_directories() {
  local path

  log "Ensuring project directory layout under ${PROJECT_ROOT}."
  for path in "${PROJECT_DIRS[@]}"; do
    sudo install -d -m 0755 -o deploy -g deploy "${path}"
  done
}

ensure_swap() {
  if swapon --show --noheadings | grep -q .; then
    log "Swap is already active; skipping swap file creation."
    return
  fi

  if ! sudo test -f "${SWAP_FILE}"; then
    log "Creating ${SWAP_SIZE_GB}G swap file at ${SWAP_FILE}."
    if ! sudo fallocate -l "${SWAP_SIZE_GB}G" "${SWAP_FILE}" 2>/dev/null; then
      log "fallocate is unavailable; falling back to dd."
      sudo dd if=/dev/zero of="${SWAP_FILE}" bs=1M count="$((SWAP_SIZE_GB * 1024))" status=none
    fi
  else
    log "Found existing swap file at ${SWAP_FILE}; activating it."
  fi

  sudo chmod 600 "${SWAP_FILE}"
  sudo mkswap "${SWAP_FILE}" >/dev/null
  sudo swapon "${SWAP_FILE}"

  if ! grep -qE "^${SWAP_FILE//\//\\/}[[:space:]]+none[[:space:]]+swap[[:space:]]+sw[[:space:]]+0[[:space:]]+0$" /etc/fstab; then
    printf '%s\n' "${SWAP_FILE} none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null
  fi

  log "Swap is active."
}

configure_docker_repository() {
  local arch

  arch="$(dpkg --print-architecture)"

  log "Configuring Docker official apt repository."
  sudo install -d -m 0755 /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/${OS_ID}/gpg" | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/%s %s stable\n' \
    "${arch}" \
    "${OS_ID}" \
    "${OS_CODENAME}" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
}

install_docker() {
  log "Installing Docker Engine and Docker Compose plugin."
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

ensure_docker_group_membership() {
  getent group docker >/dev/null 2>&1 || sudo groupadd docker

  if id -nG deploy | tr ' ' '\n' | grep -qx docker; then
    log "deploy is already a member of the docker group."
    return
  fi

  log "Adding deploy to the docker group."
  sudo usermod -aG docker deploy
}

enable_and_start_docker() {
  log "Enabling and starting Docker."
  sudo systemctl enable docker
  sudo systemctl start docker
}

print_next_steps() {
  cat <<'EOF'

[ecs-bootstrap] Bootstrap foundation finished.
[ecs-bootstrap] Next steps:
[ecs-bootstrap] 1. Reconnect over SSH so the deploy user's docker group membership is active in a fresh shell.
[ecs-bootstrap] 2. Run bash scripts/deploy/ecs/verify-bootstrap.sh
[ecs-bootstrap] This bootstrap does not deploy application code or start MySQL, Redis, Milvus Lite, runtime, frontend, or Caddy.
EOF
}

main() {
  require_deploy_user
  require_sudo
  load_os_release
  require_supported_environment
  install_base_packages
  ensure_project_directories
  ensure_swap
  configure_docker_repository
  install_docker
  ensure_docker_group_membership
  enable_and_start_docker
  print_next_steps
}

main "$@"
