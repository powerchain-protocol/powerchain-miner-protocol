#!/usr/bin/env bash
set -euo pipefail

SERVICE="${POWERCHAIN_MINER_SERVICE:-powerchain-miner.service}"
DATA_DIR="${POWERCHAIN_MINER_DATA_DIR:-/var/lib/powerchain-miner}"

systemctl is-active --quiet "$SERVICE" || {
  echo "FAIL service=$SERVICE state=inactive"
  exit 1
}

[[ -r "$DATA_DIR/state.json" ]] || {
  echo "WARN service=active state_file=missing"
  exit 0
}

echo "OK service=active data_dir=$DATA_DIR"
