#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER="${1:-}"
KEYPAIR="${2:-}"

if [[ "$CLUSTER" != "devnet" && "$CLUSTER" != "mainnet" ]]; then
  echo "Usage: $0 <devnet|mainnet> <program-keypair.json>"
  exit 1
fi

if [[ -z "$KEYPAIR" || ! -f "$KEYPAIR" ]]; then
  echo "Program keypair not found: $KEYPAIR"
  exit 1
fi

PROGRAM_ID="$(solana-keygen pubkey "$KEYPAIR")"

python3 - "$ROOT" "$CLUSTER" "$PROGRAM_ID" <<'PY'
from pathlib import Path
import re, sys

root = Path(sys.argv[1])
cluster = sys.argv[2]
program_id = sys.argv[3]

lib = root / "programs/miner/src/lib.rs"
text = lib.read_text()
text = re.sub(
    r'declare_id!\("[1-9A-HJ-NP-Za-km-z]{32,44}"\);',
    f'declare_id!("{program_id}");',
    text,
    count=1,
)
lib.write_text(text)

anchor = root / "Anchor.toml"
text = anchor.read_text()
section = "devnet" if cluster == "devnet" else "mainnet"
pattern = rf'(\[programs\.{re.escape(section)}\]\s*\nminer\s*=\s*")[^"]+(")'
text, count = re.subn(pattern, rf'\g<1>{program_id}\2', text, count=1)
if count != 1:
    raise SystemExit(f"Could not update [programs.{section}] in Anchor.toml")
anchor.write_text(text)

print(program_id)
PY

echo "Synced $CLUSTER program id: $PROGRAM_ID"
