# Verifier Architecture

PowerChain v0.6 has two separate worker boundaries.

## 1. Evidence Verifier

`services/evidence-verifier`

Purpose:
- inspect pending physical evidence;
- apply evidence policy;
- provide a named attestation and quality score;
- contribute to the configured quorum.

It does **not** hold the Solana settlement signer.

## 2. Settlement Verifier

`services/verifier-worker`

Purpose:
- read only `VERIFIED` proofs;
- require real Device/Miner PDA bindings;
- build the Anchor instruction;
- simulate the Solana transaction;
- submit it using the dedicated verifier signer;
- reconcile submitted/confirmed/failed state.

It does not decide whether raw Raspberry Pi evidence is trustworthy.

## Current Anchor client

The worker uses `@anchor-lang/core`, sets an `AnchorProvider`, then creates `Program` with the
IDL and Solana connection. The generated IDL address must match
`POWERCHAIN_MINER_PROGRAM_ID`.

## Trust separation

```text
Device identity
     ≠
Evidence verifier
     ≠
Settlement signer
     ≠
Treasury authority
     ≠
Program upgrade authority
```


## Crash recovery

Before submitting a pending verified proof, the settlement verifier reads the v1
DeviceAccount.

If:

```text
on-chain last_sequence == pending sequence
AND
on-chain last_proof_digest == pending proof digest
AND
DeviceAccount.miner == expected MinerAccount
```

the proof is reconciled as `CONFIRMED` with method `STATE` rather than resubmitted.

Normal transaction confirmation records method `TRANSACTION`.

This recovers the edge case where Solana accepted the instruction but the worker crashed
before persisting the transaction signature.
