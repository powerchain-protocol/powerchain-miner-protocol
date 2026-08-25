#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

failures=0
ok(){ printf '  [ok] %s\n' "$1"; }
warn(){ printf '  [warn] %s\n' "$1"; }
fail(){ printf '  [fail] %s\n' "$1" >&2; failures=$((failures+1)); }

echo "PowerChain programs doctor"
echo "=========================="

MINER_JSON=""
CCT_JSON=""

if MINER_JSON="$(node scripts/check-miner-program.mjs)"; then
  ok "Miner source/config contracts"
else
  fail "Miner source/config contracts"
fi

if CCT_JSON="$(node scripts/check-cct-program.mjs)"; then
  ok "CCT source/config contracts"
else
  fail "CCT source/config contracts"
fi

if command -v rustc >/dev/null 2>&1; then ok "rustc $(rustc --version | awk '{print $2}')"; else warn "Rust toolchain not installed"; fi
if command -v cargo >/dev/null 2>&1; then ok "cargo available"; else warn "cargo not installed"; fi
if command -v solana >/dev/null 2>&1; then ok "Solana CLI $(solana --version | awk '{print $2}')"; else warn "Solana CLI not installed"; fi

if command -v anchor >/dev/null 2>&1; then
  A="$(anchor --version | awk '{print $2}')"
  [[ "$A" == "1.1.2" ]] && ok "Anchor $A" || fail "Anchor $A; repository pins 1.1.2"
else
  warn "Anchor CLI not installed"
fi

if grep -q '"placeholder": true' <<<"$MINER_JSON"; then
  warn "Miner program id is still the placeholder; Miner deployment is blocked"
else
  ok "Miner program id is synchronized"
fi

if grep -q '"placeholder": true' <<<"$CCT_JSON"; then
  warn "CCT program id is still the placeholder; CCT deployment is blocked"
else
  ok "CCT program id is synchronized"
fi

if (( failures > 0 )); then exit 1; fi
