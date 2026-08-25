#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-}"
MINT="${2:-}"
TREASURY_VAULT="${3:-}"

if [[ -z "$ENV_FILE" || ! -f "$ENV_FILE" || -z "$MINT" || -z "$TREASURY_VAULT" ]]; then
  echo "Usage: $0 <env-file> <mint> <treasury-vault-token-account>"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${SOLANA_CLUSTER:?SOLANA_CLUSTER required}"
: "${SOLANA_RPC_URL:?SOLANA_RPC_URL required}"
: "${TOKEN_PROGRAM_ID:?TOKEN_PROGRAM_ID required}"
: "${MINER_GENESIS_SUPPLY:?MINER_GENESIS_SUPPLY required}"

if [[ "$SOLANA_CLUSTER" == "mainnet-beta" ]]; then
  [[ "${CONFIRM_MAINNET_BETA:-}" == "YES_I_UNDERSTAND" ]] || {
    echo "Refusing mainnet-beta genesis without CONFIRM_MAINNET_BETA=YES_I_UNDERSTAND"
    exit 1
  }
fi

solana config set --url "$SOLANA_RPC_URL" >/dev/null

echo "Mint:           $MINT"
echo "Treasury vault: $TREASURY_VAULT"
echo "Genesis supply: $MINER_GENESIS_SUPPLY MINER"
echo "Cluster:        $SOLANA_CLUSTER"
echo

spl-token --program-id "$TOKEN_PROGRAM_ID" mint \
  "$MINT" \
  "$MINER_GENESIS_SUPPLY" \
  "$TREASURY_VAULT"

echo "Revoking mint authority to make MINER fixed-supply..."
spl-token --program-id "$TOKEN_PROGRAM_ID" authorize \
  "$MINT" mint --disable

echo "Genesis complete. Verify mint supply, treasury balance, metadata, and authority state in Explorer."
