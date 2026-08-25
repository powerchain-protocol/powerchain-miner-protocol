#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

failures=0
ok(){ printf '  [ok] %s\n' "$1"; }
warn(){ printf '  [warn] %s\n' "$1"; }
fail(){ printf '  [fail] %s\n' "$1" >&2; failures=$((failures+1)); }

echo "PowerChain Miner program doctor"
echo "==============================="

node scripts/check-miner-program.mjs >/dev/null && ok "program source/config contracts" || fail "program source/config contracts"

if command -v rustc >/dev/null 2>&1; then ok "rustc $(rustc --version | awk '{print $2}')"; else warn "Rust toolchain not installed"; fi
if command -v cargo >/dev/null 2>&1; then ok "cargo available"; else warn "cargo not installed"; fi
if command -v solana >/dev/null 2>&1; then ok "Solana CLI $(solana --version | awk '{print $2}')"; else warn "Solana CLI not installed"; fi
if command -v anchor >/dev/null 2>&1; then
  A="$(anchor --version | awk '{print $2}')"
  [[ "$A" == "1.1.2" ]] && ok "Anchor $A" || fail "Anchor $A; repository pins 1.1.2"
else
  warn "Anchor CLI not installed"
fi

PROGRAM_JSON="$(node scripts/check-miner-program.mjs)"
if grep -q '"placeholder": true' <<<"$PROGRAM_JSON"; then
  warn "program id is still the placeholder; deployment is intentionally blocked"
else
  ok "program id is synchronized"
fi

if (( failures > 0 )); then exit 1; fi
