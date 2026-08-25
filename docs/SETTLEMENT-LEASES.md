# Proof Settlement Leases & Durable Intents

Canonical product version: `1.0.0`.

The Solana verifier worker is a horizontally scalable settlement service. A verified proof
must never be broadcast independently by two worker instances.

## Lease model

Workers acquire work through:

```http
POST /api/v1/internal/proofs/lease
```

The backend uses PostgreSQL:

```sql
FOR UPDATE OF p SKIP LOCKED
```

to assign each proof a bounded lease:

```text
settlement_lease_id
settlement_lease_owner
settlement_lease_until
```

The old shared `/internal/proofs/pending` queue returns `410 Gone` and cannot be used for
settlement.

## Durable intent

Before a signed Solana transaction is broadcast, the worker persists:

```text
proof_id
transaction_signature
recent_blockhash
last_valid_block_height
expected sequence
expected proof digest
expected DeviceAccount PDA
expected MinerAccount PDA
attempt
```

under `proof_settlement_intents`.

The lifecycle is:

```text
LEASED
  ↓
PREPARED
  ↓
SUBMITTED
  ↓
CONFIRMED
```

Failures become `FAILED`; ambiguous expired work may be treated as unknown/retryable only
after the previous blockhash window is no longer live.

## Crash recovery

Before sending a new transaction the worker checks, in order:

1. canonical `DeviceAccount` sequence/digest/miner state;
2. any existing settlement intent signature status;
3. the stored blockhash validity window.

If an earlier transaction is still live, the worker **does not blindly resubmit**.

If on-chain DeviceAccount state already matches the proof, the backend reconciles the proof
with:

```text
chain_reconciliation_method = STATE
```

A normal transaction-confirmation path uses:

```text
chain_reconciliation_method = TRANSACTION
```

## Lease ownership

Renew, release, intent preparation and reconciliation all require the same:

```text
proofId
leaseId
workerId
```

A worker that loses or outlives its lease receives `SETTLEMENT_LEASE_LOST` and cannot mutate
the proof settlement state.

## Observability

Prometheus exports:

```text
powerchain_miner_settlement_active_leases
powerchain_miner_settlement_intents{state=...}
powerchain_miner_settlement_state_recoveries_total
```
