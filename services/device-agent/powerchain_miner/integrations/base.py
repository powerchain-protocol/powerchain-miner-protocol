from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class EnergyReading:
    power_w: float
    quality_bps: int = 10_000

class EnergyIntegration:
    name = "base"

    def read(self) -> EnergyReading:
        raise NotImplementedError

    def identity_parts(self) -> list[str]:
        raise NotImplementedError
