# Developer Guide

## Repository domains

```text
programs/             Solana / Anchor
apps/backend/       Fastify + PostgreSQL backend
apps/console/       Next.js operator/admin UI
services/device-agent Raspberry Pi/Linux agent
services/verifier-worker
linux/                generic systemd packaging
os/                   Raspberry Pi appliance profile
ems/                  EMS integration profiles
integrations/         integration boundary docs
data/                 schemas and fixtures
tests/                cross-runtime tests
utils/                root deterministic utilities
command/              node operator CLI
```

## Program modules

```text
programs/miner/src/
├── constants.rs
├── context/
├── errors.rs
├── events.rs
├── helpers.rs
├── lib.rs
├── proof_of_energy.rs
├── state.rs
└── utils.rs
```

## Invariants

- Wh is the canonical energy unit for protocol accounting.
- Token amounts are integer MINER base units.
- Device private keys never leave the node.
- Raspberry Pi nodes cannot control mint, treasury or program upgrade authority.
- The UI never derives the authoritative reward balance.
- Proof continuity is monotonic by device sequence and previous digest.


## Proof lifecycle invariant

Never reintroduce direct reward accrual in the device-ingestion route.

The required ordering is:

```text
receive → persist PENDING → attest → finalize VERIFIED → accrue → settle
```

`apps/backend/src/evidence.ts` owns evidence finalization and reward accrual. The settlement
worker must not contain tenant reward-policy calculations.
