# Integrations

Integration layers are separated by trust boundary.

## Physical / EMS
- `/ems`
- `services/device-agent/powerchain_miner/integrations`

## Blockchain
- Solana RPC
- Anchor Miner Program
- Token-2022 MINER

## Application
- PostgreSQL
- Next.js console
- verifier worker

## Optional future connectors
- MQTT brokers
- Home Assistant
- OpenEMS
- SunSpec-compatible profiles
- Prometheus/OpenTelemetry export
- webhook notifications

An integration must normalize measurements; it must not be allowed to directly mint or
settle MINER.
