# Migration to v0.5

Run:

```bash
pnpm db:migrate
```

The migration runner now tracks numbered migrations in `schema_migrations` and applies each
one once inside a transaction.

`002_v05_hardening.sql` adds verifier retry state, claim-ledger idempotency, source rotation,
chain binding support and signed software releases.

The verifier now uses:

```text
POWERCHAIN_MINER_API_URL
```

instead of the old Next.js preview control-plane URL.

Re-run `linux/install.sh` to install the new diagnostics helper and signed update checker.
Existing device identity and queue data under `/var/lib/powerchain-miner` are preserved.
