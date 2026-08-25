# PowerChain Programs

**Canonical version:** `1.0.0`  
**Framework:** Anchor `1.1.2`

The `programs/` workspace contains PowerChain's deterministic Solana settlement programs.

| Program | Version | Token interface | Purpose |
|---|---:|---|---|
| [`miner`](miner/README.md) | `1.0.0` | Token-2022 | verified Proof-of-Energy reward accounting and claim settlement |
| [`cct`](cct/README.md) | `1.0.0` | SPL Token or Token-2022 | verified carbon-credit issuance and irreversible retirement |

## Control boundary

Programs do not establish physical truth.

```text
physical systems
    ↓
signed evidence
    ↓
verification / methodology
    ↓
policy + approvals
    ↓
wallet / verifier authorization
    ↓
Solana program
    ↓
token settlement + receipt
    ↓
reconciliation / audit
```

## Canonical Solana programs

PowerChain explicitly recognizes the canonical SPL/Metaplex program layer:

```text
System Program
11111111111111111111111111111111

SPL Token
TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Token-2022
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Associated Token Account
ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL

Metaplex Token Metadata
metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s

Metaplex Core
CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d

Metaplex Bubblegum
BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY
```

See [`../docs/SOLANA-PROGRAMS.md`](../docs/SOLANA-PROGRAMS.md).

## Development

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate

corepack pnpm program:check
corepack pnpm program:cct:check

cargo fmt --all -- --check
cargo test --workspace
anchor build
```

## Deployment

Both bundled programs still use placeholder `declare_id!` values in the source artifact.
A deployment is not ready until real program IDs, authorities, mint addresses, token program
owners, IDLs, manifests and verification evidence are synchronized.

Do not reuse one upgrade authority/keypair merely for convenience. Miner and CCT have
different economic/security domains and should have separately documented authority policy.
