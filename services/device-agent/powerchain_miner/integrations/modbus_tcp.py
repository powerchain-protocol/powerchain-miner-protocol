from __future__ import annotations
from .base import EnergyIntegration, EnergyReading

class ModbusTcpIntegration(EnergyIntegration):
    name = "modbus_tcp"

    def __init__(
        self,
        host: str,
        port: int,
        device_id: int,
        power_register: int,
        power_register_count: int,
        power_scale: float,
    ):
        from pymodbus.client import ModbusTcpClient
        self.client = ModbusTcpClient(host=host, port=port, timeout=5)
        self.host = host
        self.port = port
        self.device_id = device_id
        self.power_register = power_register
        self.power_register_count = power_register_count
        self.power_scale = power_scale

    def read(self) -> EnergyReading:
        if not self.client.connect():
            raise RuntimeError("Could not connect to Modbus TCP energy source")
        result = self.client.read_holding_registers(
            address=self.power_register,
            count=self.power_register_count,
            device_id=self.device_id,
        )
        if result.isError():
            raise RuntimeError(f"Modbus read failed: {result}")
        if self.power_register_count != 1:
            raise RuntimeError(
                "Generic adapter expects one unsigned register. "
                "Use an EMS/vendor adapter for multi-register encodings."
            )
        return EnergyReading(
            power_w=float(result.registers[0]) * self.power_scale
        )

    def identity_parts(self) -> list[str]:
        return [
            "modbus_tcp",
            self.host,
            str(self.port),
            str(self.device_id),
            str(self.power_register),
            str(self.power_scale),
        ]
