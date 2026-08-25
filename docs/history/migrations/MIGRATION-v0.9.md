# Migration to v0.9

## Database

```bash
pnpm db:migrate
```

`006_v09_production_controls.sql` adds:

- hash-chained audit logs;
- audit-chain heads and verification function;
- generic API idempotency records;
- source-rotation approval lifecycle;
- on-chain claim-settlement verification fields.

## Audit boundary

Pre-v0.9 audit rows remain historical and unchained.

New audit events must be written through `append_audit_log`; direct application inserts into
`audit_logs` should be treated as a defect.

## Claims

The Rewards console now submits claim requests with a stable `Idempotency-Key`.

Before confirming an existing approved/submitted claim, configure:

```env
POWERCHAIN_SOLANA_RPC_URL=
POWERCHAIN_MINER_MINT=
```

and ensure the client has a valid `treasury_wallet`.

The `settled` endpoint now rejects signatures that do not prove the exact Token-2022 transfer.

## Source rotation

The former one-step source-rotation endpoint is replaced by:

```text
POST .../source-rotations
POST .../source-rotations/:id/approve
POST .../source-rotations/:id/reject
```

Existing pre-v0.9 approved rotation rows remain `APPROVED`.

## Linux node

Re-run the Linux installer so the v0.9 `powerchain-miner-inspect` entry point is available.

Useful commands:

```bash
minerctl identity-raw
minerctl source-hash
```
