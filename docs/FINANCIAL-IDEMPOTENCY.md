# Financial Idempotency

Reward claim creation supports the standard HTTP header:

```text
Idempotency-Key: <client-generated stable key>
```

The key is scoped by:

```text
authenticated user
+
operation
+
idempotency key
```

The server stores a SHA-256 digest of the canonical request body.

## Replay behavior

Same key + same request:

```text
original response is returned
Idempotent-Replay: true
```

Same key + different request:

```text
409 IDEMPOTENCY_REQUEST_MISMATCH
```

A second request while the original operation is still being committed:

```text
409 IDEMPOTENCY_IN_PROGRESS
```

The claim and its `CLAIM_HOLD` ledger entry are created in the same PostgreSQL transaction
as the idempotency record, so a failed transaction does not leave a successful idempotency
record behind.

The web console renders a stable UUID in the claim form so accidental duplicate form
submission reuses the same key.
