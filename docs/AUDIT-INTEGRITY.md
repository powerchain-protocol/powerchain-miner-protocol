# Tamper-Evident Audit Integrity

Version 0.9 adds a cryptographic hash chain to all newly written audit events.

## Scope

Audit chains are independent:

```text
platform
client A
client B
client C
```

A compromised row in one client scope does not change another client's chain.

## Append invariant

Every new event commits to:

- previous event hash;
- chain scope;
- actor user ID;
- actor email;
- action;
- resource type;
- resource ID;
- client ID;
- metadata JSON;
- exact database timestamp.

Conceptually:

```text
entryHash =
SHA-256(
  previousHash
  || scope
  || actor
  || action
  || resource
  || metadata
  || timestamp
)
```

The append happens through the PostgreSQL function:

```text
append_audit_log(...)
```

`audit_chain_heads` is row-locked while a new event is appended, preventing concurrent
writers from creating two children from the same previous hash.

## Verification

Use:

```text
GET /api/v1/audit/verify
GET /api/v1/audit/verify?clientId=<uuid>
```

or the `/audit` console workspace.

Verification recalculates the hash chain in PostgreSQL using the original microsecond
timestamps and JSONB representation.

Historical pre-v0.9 events remain readable but are labelled unchained. New events begin a
fresh cryptographic chain from the v0.9 deployment boundary.

## What this does not do

Hash chaining detects database-row modification/deletion/reordering inside the retained
chain. It does not by itself prevent a database administrator from replacing the entire
database and chain head.

For stronger institutional assurance, periodically anchor the current audit head externally,
for example into immutable object storage, an organizational transparency log, or a
dedicated on-chain audit commitment.
