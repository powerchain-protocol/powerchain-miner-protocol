#!/usr/bin/env bash
set -euo pipefail
SERVICE="${POWERCHAIN_MINER_SERVICE:-powerchain-miner.service}"
DATA="${POWERCHAIN_MINER_DATA_DIR:-/var/lib/powerchain-miner}"

echo "PowerChain Renewable Miner diagnostics"
echo "======================================="
echo "date=$(date -u +%FT%TZ)"
echo "kernel=$(uname -srmo)"
echo "hostname=$(hostname)"
echo "service=$(systemctl is-active "$SERVICE" 2>/dev/null || true)"
echo "enabled=$(systemctl is-enabled "$SERVICE" 2>/dev/null || true)"
echo "python=$(python3 --version 2>&1 || true)"
echo "disk=$(df -h "$DATA" 2>/dev/null | tail -1 || true)"

if [[ -r "$DATA/queue.sqlite3" ]]; then
  echo "queued_proofs=$(sqlite3 "$DATA/queue.sqlite3" 'select count(*) from proof_queue;' 2>/dev/null || echo unknown)"
else
  echo "queued_proofs=0"
fi

if [[ -r "$DATA/state.json" ]]; then
  echo "state:"
  jq 'del(.bootstrap_token,.device_api_key,.secret,.token)' "$DATA/state.json" 2>/dev/null || true
fi

echo "recent_logs:"
journalctl -u "$SERVICE" -n 40 --no-pager 2>/dev/null || true
echo "Configuration is not dumped to avoid credential leakage."
