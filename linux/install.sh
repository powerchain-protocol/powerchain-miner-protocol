#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer with sudo/root." >&2
  exit 1
fi

ROOT="${POWERCHAIN_SOURCE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
AGENT="$ROOT/services/device-agent"

command -v systemctl >/dev/null || {
  echo "systemd is required by the base installer." >&2
  exit 1
}

if command -v apt-get >/dev/null; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip ca-certificates curl jq sqlite3
else
  echo "Automatic package installation currently supports apt-based distributions." >&2
  echo "Install Python 3, venv, pip, CA certificates, curl, jq and sqlite3 manually." >&2
fi

if ! id -u powerchain-miner >/dev/null 2>&1; then
  useradd --system --home /var/lib/powerchain-miner --shell /usr/sbin/nologin powerchain-miner
fi

install -d -m 0750 -o powerchain-miner -g powerchain-miner /var/lib/powerchain-miner
install -d -m 0755 /opt/powerchain-miner /etc/powerchain-miner
install -d -m 0755 /usr/local/lib/powerchain-miner

python3 -m venv /opt/powerchain-miner/venv
/opt/powerchain-miner/venv/bin/pip install --upgrade pip
/opt/powerchain-miner/venv/bin/pip install "$AGENT"

if [[ ! -f /etc/powerchain-miner/config.toml ]]; then
  install -m 0640 -o root -g powerchain-miner \
    "$ROOT/os/etc/powerchain-miner/config.example.toml" \
    /etc/powerchain-miner/config.toml
fi

install -m 0644 "$ROOT/linux/systemd/powerchain-miner.service" \
  /etc/systemd/system/powerchain-miner.service
install -m 0755 "$ROOT/linux/healthcheck.sh" \
  /usr/local/lib/powerchain-miner/healthcheck
install -m 0755 "$ROOT/linux/diagnostics.sh" \
  /usr/local/lib/powerchain-miner/diagnostics
install -m 0755 "$ROOT/command/minerctl" \
  /usr/local/bin/minerctl

systemctl daemon-reload
systemctl enable powerchain-miner.service

echo "Installed PowerChain Renewable Miner."
echo "Configure /etc/powerchain-miner/config.toml, then run:"
echo "  sudo systemctl start powerchain-miner"
echo "  minerctl health"
