#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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
: "${PROGRAM_KEYPAIR:?PROGRAM_KEYPAIR required}"

if [[ "$SOLANA_CLUSTER" == "mainnet-beta" ]]; then
  [[ "${CONFIRM_MAINNET_BETA:-}" == "YES_I_UNDERSTAND" ]] || {
    echo "Refusing mainnet-beta deployment without CONFIRM_MAINNET_BETA=YES_I_UNDERSTAND"
    exit 1
  }
  if [[ "$SOLANA_RPC_URL" == *"api.mainnet.solana.com"* ]]; then
    echo "Refusing production deploy through the public mainnet RPC. Configure a dedicated/private RPC."
    exit 1
  fi
fi

CLUSTER_KEY="devnet"
ANCHOR_CLUSTER="Devnet"
if [[ "$SOLANA_CLUSTER" == "mainnet-beta" ]]; then
  CLUSTER_KEY="mainnet"
  ANCHOR_CLUSTER="Mainnet"
fi

"$ROOT/scripts/sync-program-id.sh" "$CLUSTER_KEY" "$PROGRAM_KEYPAIR"

solana config set --url "$SOLANA_RPC_URL" >/dev/null

echo "Building PowerChain Miner with Anchor 1.1.2..."
(
  cd "$ROOT"
  anchor build
)

echo "Deploying to $SOLANA_CLUSTER..."
(
  cd "$ROOT"
  anchor deploy \
    --provider.cluster "$ANCHOR_CLUSTER" \
    --program-keypair "$PROGRAM_KEYPAIR"
)

PROGRAM_ID="$(solana-keygen pubkey "$PROGRAM_KEYPAIR")"

echo "Recording deployment manifest..."
POWERCHAIN_MINER_PROGRAM_ID="$PROGRAM_ID" POWERCHAIN_MINER_MINT="${POWERCHAIN_MINER_MINT:-${MINER_MINT:-}}" POWERCHAIN_MINER_TREASURY_VAULT="${POWERCHAIN_MINER_TREASURY_VAULT:-}" VERIFIER_PUBKEY="${VERIFIER_PUBKEY:-}" node "$ROOT/scripts/record-deployment.mjs" "$SOLANA_CLUSTER" "$ENV_FILE"

REQUIRE_INITIALIZED_DEPLOYMENT=0 node "$ROOT/scripts/verify-deployment-manifest.mjs" "$SOLANA_CLUSTER"

echo "Deployment complete."
echo "For a production activation, create a verifiable build and run:"
echo "  anchor verify -p powerchain_miner $PROGRAM_ID"
echo "Then set DEPLOYMENT_VERIFIED=true and record the verified manifest."
