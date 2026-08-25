#!/usr/bin/env bash
set -euo pipefail
cd /workspace/apps/compute
exec ./node_modules/.bin/tsx src/server.ts
