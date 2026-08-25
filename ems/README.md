# EMS Integrations

`/ems` contains integration profiles and contracts for Energy Management Systems (EMS),
inverters, meters, BMS platforms and site controllers.

The project intentionally does **not** guess vendor Modbus registers. Production profiles
must be populated from the equipment vendor's published register map and validated against
a physical meter before rewards are enabled.

Supported base transports:

- Modbus TCP
- HTTP/JSON
- optional MQTT contract
- file/simulator fixtures for development

Recommended integration path:

```text
Inverter / meter / BMS
        |
        v
EMS or site controller
        |
        v
PowerChain adapter
        |
        v
Normalized power_w + quality_bps
        |
        v
Proof of Energy
```

See `profiles/*.example.toml` and `docs/INTEGRATIONS.md`.
