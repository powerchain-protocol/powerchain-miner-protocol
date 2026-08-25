#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

./scripts/db-up.sh

echo "PostgreSQL is ready."
echo "Run in separate terminals:"
echo "  pnpm dev:backend"
echo "  pnpm dev:console"
echo "  pnpm dev:compute"
echo "  pnpm dev:frontend"
echo "  pnpm dev:mobile"
echo "  pnpm dev:evidence"
echo "  pnpm dev:verifier"
