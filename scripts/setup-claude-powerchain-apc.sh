#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL="${MODEL:-${POWERCHAIN_COMPUTE_MODEL:-claude-sonnet-4-6}}"

if [[ -z "${POWERCHAIN_COMPUTE_API_KEY:-}" && -z "${VIRTUALS_API_KEY:-}" ]]; then
  echo "Set POWERCHAIN_COMPUTE_API_KEY (preferred) or VIRTUALS_API_KEY." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 22 )); then
  echo "Claude Code Router requires Node.js 22 or newer." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install Claude Code tooling." >&2
  exit 1
fi

if ! command -v claude >/dev/null 2>&1; then
  npm install -g @anthropic-ai/claude-code@latest
fi

if ! command -v ccr >/dev/null 2>&1; then
  npm install -g @musistudio/claude-code-router@latest
fi

MODEL="$MODEL" \
  node "$ROOT/utilities/model-routing/list-models.mjs" "$MODEL"

MODEL="$MODEL" \
  node "$ROOT/scripts/configure-claude-powerchain-apc.mjs" on

if ! ccr restart >/dev/null 2>&1; then
  ccr start >/dev/null
fi

if [[ "${POWERCHAIN_SKIP_LIVE_VERIFY:-0}" != "1" ]]; then
  echo "Verifying Claude Code through PowerChain Agent Compute..."
  ccr code -p \
    "Reply exactly POWERCHAIN_APC_OK and nothing else." \
    --output-format text |
    grep -q "POWERCHAIN_APC_OK"
fi

cat <<EOF
PowerChain Claude Code routing configured and verified.

Run:
  ccr code

Model: $MODEL
EOF
