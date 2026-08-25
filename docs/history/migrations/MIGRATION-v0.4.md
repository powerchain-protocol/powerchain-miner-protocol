# Migration to v0.4

Version 0.4 upgrades the Anchor account layout and Proof-of-Energy instruction.

## Breaking on-chain changes

`ProtocolConfig` adds:
- `max_energy_wh_per_proof`
- `min_quality_bps`

`DeviceAccount` adds:
- `last_source_hash`

`SubmitProofArgs` now carries normalized PoE fields:
- `energy_wh`
- `sample_count`
- `quality_bps`
- `previous_digest`
- `source_hash`

The `ProofAccepted` event also changes.

## Deployment rule

Do **not** point a v0.4 binary at older initialized v0.3 accounts without an explicit
account migration.

For development/devnet, the safest upgrade is normally:
1. generate a fresh v0.4 program ID;
2. deploy v0.4 separately;
3. create/initialize fresh protocol accounts;
4. migrate test clients/devices intentionally;
5. retire the old devnet deployment.

For an existing production program, use an audited Anchor account migration strategy and
preserve historical evidence/reward reconciliation. Never overwrite account layouts
implicitly.

## Backend database

The current `001_init.sql` represents a fresh v0.4 database. Existing PostgreSQL databases
should use a numbered forward migration rather than re-running an edited initial migration.
Before production adoption, freeze `001_init.sql` and create `002_poe_v1.sql` for deployed
installations.
