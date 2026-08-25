from __future__ import annotations
import json
import urllib.request
from typing import Any
from .base import EnergyIntegration, EnergyReading

class HttpJsonIntegration(EnergyIntegration):
    name = "http_json"

    def __init__(self, url: str, power_field: str, timeout: float = 5.0):
        self.url = url
        self.power_field = power_field
        self.timeout = timeout

    def read(self) -> EnergyReading:
        with urllib.request.urlopen(self.url, timeout=self.timeout) as response:
            value: Any = json.loads(response.read().decode("utf-8"))
        for part in self.power_field.split("."):
            value = value[part]
        return EnergyReading(power_w=float(value))

    def identity_parts(self) -> list[str]:
        return ["http_json", self.url, self.power_field]
