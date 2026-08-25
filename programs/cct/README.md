# PowerChain CCT Program

**Version:** `1.0.0`  
**Purpose:** verified carbon-credit issuance and irreversible retirement  
**Token support:** SPL Token or Token-2022 via Anchor Token Interface  
**Recommended deployment:** Token-2022, 6 decimals

The CCT program is separate from the Miner reward program. It does not infer emissions,
calculate avoided carbon from raw telemetry, or decide whether a carbon project is valid.

```text
meter / project evidence
        ↓
verification + methodology
        ↓
authorized carbon verifier
        ↓
issue_verified_batch
        ↓
CCT mint
        ↓
holder / market
        ↓
retire_credits
        ↓
burn + RetirementReceipt
```

## Canonical unit

```text
1 CCT = 1 metric tonne CO2e
1 CCT = 1,000,000 base units
decimals = 6
```

## Accounts

- `CctRegistry` — authority, verifier, CCT mint, token program, issuance/retirement totals.
- `CarbonProject` — deterministic project identity and metadata evidence hash.
- `CarbonBatch` — unique verified issuance record.
- `RetirementReceipt` — unique irreversible retirement record.

## Instructions

| Instruction | Authority | Purpose |
|---|---|---|
| `initialize_registry` | registry authority | bind CCT mint, token program and verifier |
| `register_project` | registry authority | register a verified carbon-project identity |
| `set_project_active` | registry authority | suspend/reactivate issuance for one project |
| `issue_verified_batch` | configured verifier | mint a unique verified CCT batch |
| `retire_credits` | token owner | burn CCT and create a one-time retirement receipt |
| `set_paused` | registry authority | stop/resume CCT issuance and retirement |
| `set_verifier` | registry authority | rotate carbon verifier signer |
| `propose_authority` | current authority | begin two-step registry authority transfer |
| `cancel_authority_transfer` | current authority | cancel a pending transfer |
| `accept_authority` | pending authority | accept registry authority |

## Token programs

The registry stores the token program selected at initialization and cannot switch between
classic SPL Token and Token-2022 later.

Supported canonical program IDs:

```text
SPL Token
TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Token-2022
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

Token-2022 is recommended for new CCT deployments because metadata and other extensions can
be colocated with the mint. Metaplex Token Metadata is also supported at the application/SDK
layer for discoverability.

## Deployment warning

`declare_id!` remains the system-program placeholder. No production CCT mint or CCT program
address is fabricated in source. Synchronize a real program keypair, mint, mint-authority PDA,
metadata, deployment manifest, verifier, and organizational authority before deployment.
