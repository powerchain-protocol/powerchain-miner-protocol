#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL="${MODEL:-${POWERCHAIN_COMPUTE_MODEL:-openai-gpt-55}}"

if [[ -z "${POWERCHAIN_COMPUTE_API_KEY:-}" && -z "${VIRTUALS_API_KEY:-}" ]]; then
  echo "Set POWERCHAIN_COMPUTE_API_KEY (preferred) or VIRTUALS_API_KEY." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required." >&2
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "Codex is missing and npm is unavailable." >&2
    exit 1
  fi
  npm install -g @openai/codex@latest
fi

MODEL="$MODEL" \
  node "$ROOT/utilities/model-routing/list-models.mjs" "$MODEL"

MODEL="$MODEL" \
  node "$ROOT/scripts/configure-codex-powerchain-apc.mjs" on

cat <<EOF
PowerChain Codex routing configured.

1. Start the translator:
   make codex-proxy

2. Launch Codex:
   codex

Model: $MODEL
EOF
