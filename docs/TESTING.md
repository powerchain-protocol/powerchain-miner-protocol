# Testing

Run fast deterministic tests:

```bash
./scripts/test.sh
```

Run repository validation:

```bash
./scripts/check.sh
```

Mainnet readiness additionally requires:
- Anchor program tests
- local validator/LiteSVM integration coverage
- PostgreSQL transaction/RBAC tests
- device signature/replay tests
- meter integration hardware tests
- treasury reconciliation tests
- independent security review


## v0.6 test priorities

Production CI should add database-backed integration cases for:

- duplicate proof sequence;
- digest continuity failure;
- approved source rotation;
- quorum not yet reached;
- one verifier rejection;
- quality below policy minimum;
- missing reward owner;
- duplicate attestation;
- duplicate reward accrual;
- daily reward cap;
- exact backend/on-chain reward ceiling;
- settlement retry and confirmation reconciliation.


## v1.0 invariant coverage

Lightweight protocol tests now additionally cover:

- Anchor `claim_rewards` instruction codec layout;
- 16-byte UUID claim seed;
- u64 reward amount boundary;
- non-overlapping economic-window migration declarations;
- append-only ledger/audit/checkpoint controls;
- one-time ClaimReceipt and claim-authorization expiry declarations.

Production CI also runs PostgreSQL migration/invariant smoke tests when dependencies are
installed.
