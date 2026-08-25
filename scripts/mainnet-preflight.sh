#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-config/miner.mainnet-beta.env}"
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }

node utils/validate-config.mjs "$ENV_FILE"
grep -q '^CONFIRM_MAINNET_BETA=YES_I_UNDERSTAND$' "$ENV_FILE" || {
  echo "Mainnet acknowledgement missing." >&2
  exit 1
}

echo "Mainnet preflight configuration present."
echo "This does not replace program audit, deployment verification, authority inspection,"
echo "treasury reconciliation, or incident-response readiness."
