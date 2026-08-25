from __future__ import annotations
import hashlib
from typing import Iterable

def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def source_hash(*parts: str) -> str:
    canonical = "\x1f".join(part.strip() for part in parts)
    return sha256_hex(canonical.encode("utf-8"))

def average_int(values: Iterable[float]) -> int:
    items = list(values)
    if not items:
        return 0
    return int(round(sum(items) / len(items)))
