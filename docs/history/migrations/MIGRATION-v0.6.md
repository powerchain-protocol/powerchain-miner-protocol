# Migration to v0.6

## Database

```bash
pnpm db:migrate
```

`003_v06_evidence_verification.sql` adds:

- verification policies;
- proof attestations;
- pending/verified/rejected evidence lifecycle;
- stored reward-policy/epoch binding;
- verified/rejected timestamps;
- device proof/source continuity fields.

Existing historical `VERIFIED` proofs remain historical records.

## Behavioral change

`POST /api/v1/proofs` now returns **HTTP 202** and does not immediately accrue MINER.

Start the evidence worker:

```bash
pnpm dev:evidence
```

A proof reaches `VERIFIED` only after the required attestation quorum.

## Solana instruction change

`SubmitProofArgs` now includes `reward_base_units`.

The backend computes the exact tenant-specific reward. The on-chain program checks that the
submitted value is below:

1. the protocol-wide maximum rate for quality-adjusted Wh;
2. the per-proof maximum;
3. the global emission cap.

Regenerate the IDL and update the settlement worker before upgrading a deployed program.

## Reward ownership

Existing devices should be assigned an explicit reward owner in `/clients/:clientId`.
Unowned devices may submit/attest evidence but do not finalize reward accrual.
