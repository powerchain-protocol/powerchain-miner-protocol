#!/usr/bin/env bash
set -euo pipefail
ROOT="${POWERCHAIN_SOURCE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
exec env POWERCHAIN_SOURCE_ROOT="$ROOT" "$ROOT/linux/install.sh"
