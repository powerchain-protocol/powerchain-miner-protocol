# Operator Guide

## Daily checks

```bash
minerctl health
minerctl queue
minerctl status
```

In the web console verify:
- node heartbeat
- proof acceptance rate
- energy totals
- quality basis points
- reward accrual
- verifier/chain state

## Incident actions

### Meter unavailable
Do not fabricate measurements. Allow the proof queue to stop growing until physical truth
is restored.

### Internet unavailable
The Pi retains generated proofs in its local SQLite queue and retries later.

### Device key suspected compromised
Disable the device in the client console, preserve logs/evidence and re-enroll with a new
device identity.

### Verifier compromise
Pause the on-chain protocol and rotate verifier authority before resuming settlement.


## Dead-letter proof chain

Inspect:

```bash
minerctl queue-dead
```

A dead-letter means the node deliberately stopped later proof submission to preserve digest
continuity.

Common causes:

- meter/source changed without an approved rotation;
- conflicting sequence;
- digest continuity mismatch;
- physically impossible proof bounds;
- invalid proof timestamp.

After correcting the backend/device configuration:

```bash
minerctl queue-retry
```

The node retries from the oldest blocked proof.

Do not delete an intermediate proof merely to make later proofs upload—the later
`previousDigest` values depend on it.
