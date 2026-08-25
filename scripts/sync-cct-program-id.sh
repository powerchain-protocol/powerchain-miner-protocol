#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER="${1:-}"
KEYPAIR="${2:-}"

if [[ "$CLUSTER" != "devnet" && "$CLUSTER" != "mainnet" ]]; then
  echo "Usage: $0 <devnet|mainnet> <cct-program-keypair.json>" >&2
  exit 2
fi

if [[ -z "$KEYPAIR" || ! -f "$KEYPAIR" ]]; then
  echo "CCT program keypair not found: $KEYPAIR" >&2
  exit 2
fi

command -v solana-keygen >/dev/null 2>&1 || {
  echo "solana-keygen is required." >&2
  exit 1
}

PROGRAM_ID="$(solana-keygen pubkey "$KEYPAIR")"

python3 - "$ROOT" "$CLUSTER" "$PROGRAM_ID" <<'PY'
from pathlib import Path
import re
import sys

root = Path(sys.argv[1])
cluster = sys.argv[2]
program_id = sys.argv[3]

lib = root / "programs/cct/src/lib.rs"
source = lib.read_text()
source, count = re.subn(
    r'declare_id!\("[1-9A-HJ-NP-Za-km-z]{32,44}"\);',
    f'declare_id!("{program_id}");',
    source,
    count=1,
)
if count != 1:
    raise SystemExit("Could not update CCT declare_id!")
lib.write_text(source)

anchor = root / "Anchor.toml"
source = anchor.read_text()
section = "devnet" if cluster == "devnet" else "mainnet"
pattern = rf'(\[programs\.{re.escape(section)}\][\s\S]*?cct\s*=\s*")[^"]+(")'
source, count = re.subn(pattern, rf'\g<1>{program_id}\2', source, count=1)
if count != 1:
    raise SystemExit(f"Could not update [programs.{section}] cct in Anchor.toml")
anchor.write_text(source)
print(program_id)
PY

echo "Synced CCT $CLUSTER program id: $PROGRAM_ID"
