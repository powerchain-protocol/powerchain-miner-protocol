from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Any

@dataclass(frozen=True)
class DeviceContext:
    device_id: str
    client_id: str
    renewable_type: str
    source_kind: str
    data_dir: Path

@dataclass(frozen=True)
class SamplingContext:
    sample_interval_seconds: float
    proof_interval_seconds: float
    heartbeat_interval_seconds: float

def build_context(config: dict[str, Any], state: dict[str, Any]) -> DeviceContext:
    device = config["device"]
    source = config["source"]
    client_id = str(state.get("client_id", ""))
    if not client_id:
        raise RuntimeError("Device has not been enrolled into a client.")
    return DeviceContext(
        device_id=str(device["id"]),
        client_id=client_id,
        renewable_type=str(device.get("renewable_type", "other")),
        source_kind=str(source.get("kind", "unknown")),
        data_dir=Path(str(device.get("data_dir", "/var/lib/powerchain-miner"))),
    )
