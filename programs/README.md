# PowerChain Programs

The `programs/` workspace contains the on-chain Solana programs that form the deterministic settlement layer of PowerChain.

## Programs

| Program | Version | Purpose |
|---|---:|---|
| [`miner`](miner/README.md) | `1.0.0` | verified Proof-of-Energy reward accounting and Token-2022 treasury settlement |

## Boundary

On-chain programs enforce deterministic authorization and settlement rules. They do not ingest raw meter telemetry, call external APIs, perform AI inference, or decide whether physical evidence is trustworthy.

```text
physical measurement
      ↓
off-chain evidence + verification
      ↓
backend economic policy
      ↓
wallet authorization
      ↓
Solana program
      ↓
settlement receipt
```

## Development

The Rust workspace is defined in the root [`Cargo.toml`](../Cargo.toml), with Anchor configuration in [`Anchor.toml`](../Anchor.toml).

Before deploying any program, synchronize the real program ID across the Rust source, Anchor configuration, backend environment, SDK, and deployment manifest.
