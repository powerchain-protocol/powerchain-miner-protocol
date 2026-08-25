# PowerChain Evidence Verifier

**Version:** `1.0.0`  
**Runtime:** Node.js `24.19.x`

The Evidence Verifier consumes pending evidence from the control plane, performs deterministic
verification-policy checks, signs the attestation payload with its own Ed25519 verifier key,
and submits the attestation back to `/api/v1`.

It is one member of a verifier quorum; it does not directly settle Solana transactions.

## Checks

The baseline implementation checks:

- minimum sample count;
- verification-policy energy limit;
- optional average-power limit;
- SHA-256 digest shape;
- configured verified quality.

The backend remains authoritative for verifier registry status, verifier class, quorum,
reward-owner membership and final reward calculation.

## Required environment

Copy `.env.example` and configure:

```env
POWERCHAIN_MINER_API_URL=
POWERCHAIN_EVIDENCE_WORKER_TOKEN=
EVIDENCE_VERIFIER_REGISTRY_ID=
EVIDENCE_VERIFIER_ID=
EVIDENCE_VERIFIER_PRIVATE_KEY=
```

The private key path should point to a host-mounted secret with restrictive permissions. Do
not commit private verifier material.

## Run

```bash
corepack pnpm --filter @powerchain/evidence-verifier dev
```

or:

```bash
corepack pnpm dev:evidence
```

## Failure model

Queue/read failures are logged and retried after `POLL_INTERVAL_MS`. Individual proof errors
do not stop the verifier loop.

Verifier decisions are explicit `APPROVE` or `REJECT`; the service does not manufacture
telemetry, replace missing evidence, or silently lower policy thresholds.
