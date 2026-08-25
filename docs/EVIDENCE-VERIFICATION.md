# Evidence Verification

Version 0.6 separates **receiving a signed device measurement** from **deciding that the
measurement deserves a MINER reward**.

## State machine

```text
Raspberry Pi signed PoE
        ↓
      PENDING
        ↓
evidence attestations
   ┌────┴────┐
   ↓         ↓
REJECTED   quorum reached
             ↓
          VERIFIED
             ↓
        reward ledger
             ↓
     settlement verifier
             ↓
           Solana
```

A device signature proves which enrolled device sent the evidence. It does **not** prove
that the physical measurement itself is economically trustworthy.

## Verification policy

Each client/source can configure:

- minimum attestations;
- minimum verified quality;
- maximum Wh per proof;
- optional maximum average power;
- source-continuity requirement.

The platform supports multiple independent `verifierId` attestations. Production systems
should use independent evidence sources where appropriate—for example a revenue-grade meter,
EMS/SCADA observation, inverter telemetry, or external attestation service.

## Baseline evidence worker

`services/evidence-verifier` is a deterministic reference worker. It enforces configured
bounds and creates a service attestation. It is not a substitute for independent physical
meter verification.

## Reward owner

A proof can be attested while a device has no reward owner, but reward finalization remains
PENDING until the client administrator explicitly assigns an active member to the device.
This prevents anonymous/shared ledger balances from being claimed by arbitrary members.
