# Solana DePIN Integration

PowerChain follows the official Solana Developers DePIN patterns for connecting physical
devices to Solana:

```text
physical device
  ↓
Ed25519 device identity
  ↓
off-chain observation / oracle / verifier
  ↓
PDA-backed program state
  ↓
controlled token/reward settlement
```

There is currently no official published npm dependency named `@solana/depin` used by the
Solana Developers examples. PowerChain therefore does **not** invent that dependency.

Reference implementation patterns are tracked from:

```text
https://github.com/solana-developers/solana-depin-examples
```

PowerChain's concrete implementation lives in:

```text
services/device-agent/
packages/powerchain-protocol/miner/src/depin/
programs/miner/
```

Supported physical classes include Raspberry Pi, ESP32, smart meters and LoRaWAN/Helium
gateways.
