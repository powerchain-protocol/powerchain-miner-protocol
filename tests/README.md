# Tests

The test tree is layered:

```text
tests/
├── node/       deterministic JS protocol utilities
├── python/     Raspberry Pi Proof-of-Energy/unit tests
├── fixtures/   cross-runtime canonical JSON / SHA-256 PoE vectors
└── shell/      installer/command checks
```

Run:

```bash
./scripts/test.sh
./scripts/check.sh
```

Anchor/Rust tests run when Cargo is available. Full integration tests additionally require
PostgreSQL, Solana local validator/LiteSVM as configured by the developer environment, and
the pinned Anchor toolchain.


v0.7 Python coverage additionally checks durable queue retry/dead-letter behavior,
sampling/fractional-Wh behavior, telemetry-gap handling, and HTTP retry classification.
