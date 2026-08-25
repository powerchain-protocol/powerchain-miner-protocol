# PowerChain Device Agent

**Version:** `1.0.0`  
**Runtime:** Python `>=3.11`  
**Targets:** Raspberry Pi and Linux edge nodes

The Device Agent converts physical renewable-energy readings into signed, durable
Proof-of-Energy evidence.

It does **not** hold Solana treasury/program authority keys and it does not mint rewards.

## Data path

```text
meter / EMS / inverter
        ↓
source adapter
        ↓
bounded energy accumulator
        ↓
canonical Proof of Energy
        ↓
device Ed25519 signature
        ↓
SQLite durable queue
        ↓
PowerChain /api/v1 device endpoint
```

## Supported source adapters

- `mock` — development only;
- `http_json` — explicit HTTPS/HTTP JSON field mapping;
- `modbus_tcp` — explicit vendor register configuration;
- `mqtt` — reserved/fail-closed until the optional TLS client is installed/configured.

No Modbus register map is guessed.

## Safety properties

- Ed25519 private identity is created locally with mode `0600`;
- one delayed telemetry sample is never extrapolated across an extended gap;
- fractional Wh is carried deterministically;
- proof sequence/digest state is crash-safe;
- the SQLite queue persists unsent evidence;
- failed submissions use bounded retry/dead-letter behavior.

## Configuration

Canonical appliance configuration:

```text
os/etc/powerchain-miner/config.example.toml
```

Key sections:

```toml
[device]
[server]
[source]
[sampling]
```

For first enrollment the node needs a device bootstrap/API credential. After enrollment,
normal evidence requests are device-signed.

## Commands

Installed entry points:

```text
powerchain-miner
powerchain-miner-update
powerchain-miner-inspect
```

Development:

```bash
cd services/device-agent
python3 -m venv .venv
. .venv/bin/activate
pip install -e .
powerchain-miner --help
```

## Helium / LoRaWAN

Helium gateways can coexist with the PowerChain device node as a connectivity layer. The
Helium gateway identity remains separate from the PowerChain meter/device signing key.

See [`../../integrations/helium/README.md`](../../integrations/helium/README.md).
