# Meter / EMS Source Rotation

Changing the physical evidence origin is a security-sensitive operation.

v0.9 uses:

```text
REQUESTED
   ↓
independent approval
   ↓
APPROVED
   ↓
first valid proof from new source
   ↓
APPLIED
```

## Request

`CLIENT_ADMIN` or `OPERATOR` requests the change.

The API records the currently established device `source_hash` itself. The caller cannot
rewrite the previous identity.

## Approval

`CLIENT_ADMIN` or `VERIFIER` may approve, but **the requester can never approve their own
rotation**, including SuperAdmin.

Approval fails if the current device source changed after the request was created.

## Application

An approved rotation is consumed only when the first valid signed proof arrives with:

```text
previous source hash = request.previous_source_hash
new source hash      = request.next_source_hash
```

The proof transaction atomically marks the rotation `APPLIED`.

## Operator command

On the node, calculate the configured source identity with:

```bash
minerctl source-hash
```

After replacing a meter/EMS, run the command using the replacement configuration before
starting normal proof submission, request the rotation in the client console, obtain an
independent approval, then resume the miner service.
