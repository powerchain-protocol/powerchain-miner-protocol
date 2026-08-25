from __future__ import annotations
from typing import Any
from .http_json import HttpJsonIntegration
from .mock import MockIntegration
from .modbus_tcp import ModbusTcpIntegration

def build_integration(config: dict[str, Any]):
    kind = str(config.get("kind", "mock"))

    if kind == "mock":
        return MockIntegration(float(config.get("nominal_power_w", 4500)))

    if kind == "http_json":
        return HttpJsonIntegration(
            str(config["url"]),
            str(config["power_field"]),
            float(config.get("timeout_seconds", 5)),
        )

    if kind == "modbus_tcp":
        return ModbusTcpIntegration(
            host=str(config["host"]),
            port=int(config.get("port", 502)),
            device_id=int(config.get("device_id", 1)),
            power_register=int(config["power_register"]),
            power_register_count=int(config.get("power_register_count", 1)),
            power_scale=float(config.get("power_scale", 1.0)),
        )

    raise ValueError(f"Unsupported energy integration: {kind}")
