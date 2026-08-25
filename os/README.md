# PowerChain Renewable Miner OS

`PowerChain Renewable Miner OS` is an appliance profile built on Raspberry Pi OS Lite
64-bit rather than a custom Linux fork.

## Hardware baseline

- Raspberry Pi 5, 4 GB or 8 GB
- quality 32+ GB microSD or NVMe SSD
- official USB-C power supply
- active cooling
- Ethernet preferred for stationary installations
- optional industrial RS-485/Modbus interface
- optional secure element for a future hardware-backed device identity

## Trust boundary

The Pi owns only its device Ed25519 identity. It does not hold:

- MINER mint authority
- protocol authority
- Solana program upgrade authority
- treasury authority
- validator/verifier authority

## Meter adapters

The reference agent supports:

- `mock` — development only
- `http_json`
- `modbus_tcp`

Every production meter/inverter requires an explicit vendor register map and scale review.
Do not guess Modbus register addresses.

## Service hardening

The systemd unit runs a dedicated unprivileged `powerchain-miner` account with:

- `NoNewPrivileges`
- `ProtectSystem=strict`
- protected home/kernel/control groups
- write access only to `/var/lib/powerchain-miner`
- read-only configuration in `/etc/powerchain-miner`
