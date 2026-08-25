# Solana Program Registry

**Canonical PowerChain version:** `1.0.0`

This file centralizes external program identifiers used by PowerChain. Application code
imports the same values from `@powerchain-protocol/miner/solana`.

## Solana / SPL

| Program | Address |
|---|---|
| System | `11111111111111111111111111111111` |
| SPL Token | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Token-2022 | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Associated Token Account | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` |

## Metaplex

| Program | Address |
|---|---|
| Token Metadata | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` |
| Core | `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d` |
| Bubblegum | `BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY` |
| Token Authorization Rules | `auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg` |

## PowerChain programs

PowerChain Miner and CCT program IDs are deployment-specific and intentionally remain
placeholders in source until a real deployment keypair is synchronized.

Do not confuse a canonical external program ID with a PowerChain deployment address.

## Token standards

PowerChain supports:

- classic SPL fungible tokens;
- Token-2022 mints/extensions;
- associated token accounts;
- Token-2022 metadata pointer/token metadata;
- Metaplex Token Metadata;
- Metaplex Core/Bubblegum asset discovery where appropriate.

Metadata never replaces project/device/evidence verification.
