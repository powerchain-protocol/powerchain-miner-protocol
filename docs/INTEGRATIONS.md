# EMS and Integration Guide

## Supported base adapters

### Modbus TCP
Configure register address, type/count and scaling from the equipment manufacturer's
published register map.

### HTTP JSON
Use a narrow endpoint exposing only required measurement fields.

### MQTT
The base repository reserves a contract but does not enable MQTT automatically. Production
MQTT must use TLS, broker authentication and bounded reconnect behavior.

## EMS systems

An EMS integration should normalize data to:

```text
power_w: float
quality_bps: integer 1..10000
source identity
```

Possible integration families include Home Assistant, OpenEMS, SunSpec-oriented gateways,
inverter APIs and site SCADA gateways, but vendor mappings require equipment-specific
validation.

## Trust rule

An integration can provide measurements. It cannot authorize MINER settlement.
