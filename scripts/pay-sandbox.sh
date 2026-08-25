#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: pnpm pay:sandbox -- <https-url>" >&2
  exit 2
fi

URL="$1"
if [[ ! "$URL" =~ ^https:// ]]; then
  echo "pay sandbox target must be an HTTPS URL" >&2
  exit 2
fi

exec npx --yes @solana/pay@1.0.26 \
  --no-dna \
  --sandbox \
  curl "$URL"
