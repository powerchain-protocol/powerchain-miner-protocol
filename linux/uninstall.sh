#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run with sudo/root." >&2
  exit 1
fi

systemctl disable --now powerchain-miner.service 2>/dev/null || true
rm -f /etc/systemd/system/powerchain-miner.service
rm -f /usr/local/bin/minerctl
rm -f /usr/local/lib/powerchain-miner/healthcheck
rm -f /usr/local/lib/powerchain-miner/diagnostics
rm -rf /opt/powerchain-miner
systemctl daemon-reload

echo "Runtime removed."
echo "Configuration and data were preserved:"
echo "  /etc/powerchain-miner"
echo "  /var/lib/powerchain-miner"
