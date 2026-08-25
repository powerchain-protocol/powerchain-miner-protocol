#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${POWERCHAIN_COMPUTE_API_KEY:-}" && -z "${VIRTUALS_API_KEY:-}" ]]; then
  echo "Set POWERCHAIN_COMPUTE_API_KEY (preferred) or VIRTUALS_API_KEY." >&2
  exit 1
fi

if [[ -z "${POWERCHAIN_COMPUTE_API_KEY:-}" && -n "${VIRTUALS_API_KEY:-}" ]]; then
  export POWERCHAIN_COMPUTE_API_KEY="$VIRTUALS_API_KEY"
fi

exec node \
  "$ROOT/utilities/model-routing/codex-powerchain-proxy/server.mjs"
