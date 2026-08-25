# Migration to v0.7

## Database

```bash
pnpm db:migrate
```

`004_v07_logic_hardening.sql` adds:

- reward claim lifecycle timestamps;
- per-device offline timeout;
- stale-device indexes;
- verification-policy delayed-submission limits.

## Raspberry Pi

Re-run:

```bash
sudo POWERCHAIN_SOURCE_ROOT="$PWD" ./linux/install.sh
```

The SQLite proof queue migrates itself in place and retains existing queued payloads.

New queue commands:

```bash
minerctl queue
minerctl queue-dead
minerctl queue-retry
```

Do not run `queue-retry` until the underlying continuity/source problem is corrected.

## Offline evidence

The previous fixed 15-minute upload age limit has been removed.

Verification policies now control:

```text
maxSubmissionDelaySeconds
```

Default:

```text
604800
```

which is seven days.

Maximum supported by the schema:

```text
2592000
```

which is 30 days.

## Claims

Reward claims now perform the balance calculation and hold creation inside the same locked
transaction. This is a behavioral/security fix for concurrent requests.

Any active client member may request their own accrued reward. Finance still approves
claims; normal users see only their own claims.

## Proof retries

Same `(device, sequence, digest)` retries are idempotent.

Temporary policy setup returns `425`, while continuity/physical-limit errors use stable error
codes and enter the node dead-letter workflow.


## Solana proof timestamp semantics

The v0.7 Anchor instruction adds `verified_at`, and `ProtocolConfig` adds
`max_observation_age_secs`.

This is a breaking IDL/account-layout change. Regenerate the IDL and migrate/reinitialize
program accounts before deploying the new binary.

The program no longer requires the raw off-chain `previous_digest` to equal the last
on-chain verified digest; monotonic sequence remains enforced.
