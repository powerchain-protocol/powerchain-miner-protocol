#!/usr/bin/env bash
set -euo pipefail
docker compose up -d postgres
echo "PostgreSQL started."
echo "Run in separate terminals:"
echo "  pnpm dev:api"
echo "  pnpm dev"
echo "  pnpm dev:evidence"
echo "  pnpm dev:verifier"
