from __future__ import annotations
import json
from datetime import datetime, timezone
from typing import Any

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def canonical_json(value: dict[str, Any]) -> str:
    return json.dumps(value, separators=(",", ":"), sort_keys=True, ensure_ascii=False)

def clamp_int(value: int, minimum: int, maximum: int) -> int:
    return min(max(value, minimum), maximum)
