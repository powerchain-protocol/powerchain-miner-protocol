from __future__ import annotations
import random
from .base import EnergyIntegration, EnergyReading

class MockIntegration(EnergyIntegration):
    name = "mock"

    def __init__(self, nominal_power_w: float = 4500):
        self.nominal_power_w = nominal_power_w

    def read(self) -> EnergyReading:
        power = max(0.0, random.gauss(self.nominal_power_w, self.nominal_power_w * 0.08))
        return EnergyReading(power_w=power, quality_bps=10_000)

    def identity_parts(self) -> list[str]:
        return ["mock", str(self.nominal_power_w)]
