from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass
from typing import Any

from .constants import DEFAULT_QUALITY_BPS, QUALITY_BPS_MAX
from .utils import canonical_json, utc_now_iso

@dataclass(frozen=True)
class ProofOfEnergy:
    sequence: int
    observedAt: str
    renewableType: str
    energyDeltaWh: int
    averagePowerW: int
    sampleCount: int
    source: str
    qualityBps: int
    sourceHash: str
    previousDigest: str

    def payload(self) -> dict[str, Any]:
        return asdict(self)

    def digest(self) -> str:
        return hashlib.sha256(
            canonical_json(self.payload()).encode("utf-8")
        ).hexdigest()

def build_proof(
    *,
    sequence: int,
    renewable_type: str,
    energy_wh: int,
    average_power_w: int,
    sample_count: int,
    source: str,
    source_hash: str,
    previous_digest: str,
    quality_bps: int = DEFAULT_QUALITY_BPS,
) -> ProofOfEnergy:
    if sequence <= 0:
        raise ValueError("sequence must be positive")
    if energy_wh <= 0:
        raise ValueError("energy_wh must be positive")
    if sample_count <= 0:
        raise ValueError("sample_count must be positive")
    if not (1 <= quality_bps <= QUALITY_BPS_MAX):
        raise ValueError("quality_bps must be between 1 and 10000")
    if len(source_hash) != 64:
        raise ValueError("source_hash must be a SHA-256 hex digest")

    return ProofOfEnergy(
        sequence=sequence,
        observedAt=utc_now_iso(),
        renewableType=renewable_type,
        energyDeltaWh=energy_wh,
        averagePowerW=max(0, average_power_w),
        sampleCount=sample_count,
        source=source,
        qualityBps=quality_bps,
        sourceHash=source_hash,
        previousDigest=previous_digest,
    )
