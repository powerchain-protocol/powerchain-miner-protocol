#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-}"
if [[ -z "$ENV_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "Usage: $0 <env-file>"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${SOLANA_CLUSTER:?SOLANA_CLUSTER required}"
: "${SOLANA_RPC_URL:?SOLANA_RPC_URL required}"
: "${TOKEN_PROGRAM_ID:?TOKEN_PROGRAM_ID required}"
: "${MINER_TOKEN_NAME:?MINER_TOKEN_NAME required}"
: "${MINER_TOKEN_SYMBOL:?MINER_TOKEN_SYMBOL required}"
: "${MINER_TOKEN_DECIMALS:?MINER_TOKEN_DECIMALS required}"
: "${MINER_METADATA_URI:?MINER_METADATA_URI required}"

if [[ "$SOLANA_CLUSTER" == "mainnet-beta" ]]; then
  [[ "${CONFIRM_MAINNET_BETA:-}" == "YES_I_UNDERSTAND" ]] || {
    echo "Refusing mainnet-beta token creation without CONFIRM_MAINNET_BETA=YES_I_UNDERSTAND"
    exit 1
  }
fi

solana config set --url "$SOLANA_RPC_URL" >/dev/null

echo "Creating Token-2022 MINER mint on $SOLANA_CLUSTER..."
OUTPUT="$(
  spl-token create-token \
    --program-id "$TOKEN_PROGRAM_ID" \
    --decimals "$MINER_TOKEN_DECIMALS" \
    --enable-metadata
)"

echo "$OUTPUT"

MINT="$(printf '%s\n' "$OUTPUT" | awk '/Creating token/ {print $3; exit}')"
if [[ -z "$MINT" ]]; then
  echo "Could not parse mint address. Copy the mint from the command output manually."
  exit 1
fi

spl-token initialize-metadata \
  "$MINT" \
  "$MINER_TOKEN_NAME" \
  "$MINER_TOKEN_SYMBOL" \
  "$MINER_METADATA_URI"

echo
echo "MINER_MINT=$MINT"
echo "Next: initialize the miner protocol so it creates its Token-2022 treasury vault."
echo "Then mint the reviewed genesis supply into that vault and revoke mint authority."
