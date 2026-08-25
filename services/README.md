# PowerChain Services

**Canonical version:** `1.0.0`

`services/` contains long-running processes that bridge physical evidence, verification and
on-chain settlement. They are operational services, not user-facing applications.

| Service | Runtime | Authority | Purpose |
|---|---|---|---|
| [`device-agent`](device-agent/README.md) | Python 3.11+ | device Ed25519 identity | meter/EMS sampling, durable Proof-of-Energy queue, signed submission |
| [`evidence-verifier`](evidence-verifier/README.md) | Node.js 24 | evidence-verifier Ed25519 identity | deterministic policy checks and signed evidence attestations |
| [`verifier-worker`](verifier-worker/README.md) | Node.js 24 | Solana verifier keypair | leased verified-proof settlement and crash-safe reconciliation |

Trust separation is deliberate:

```text
device identity ≠ evidence-verifier identity ≠ Solana verifier identity ≠ treasury wallet
```

## Development

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate

corepack pnpm dev:evidence
corepack pnpm dev:verifier
```

The Python node can be run independently from `services/device-agent`.

## Service documentation contract

Every long-running service must document:

- runtime and version;
- inputs/outputs;
- credential class;
- health/observability path;
- restart/retry behavior;
- data persistence;
- production deployment boundary.

`corepack pnpm services:check` validates this documentation surface.
