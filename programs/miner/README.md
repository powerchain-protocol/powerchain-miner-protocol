# PowerChain Miner Program

**Version:** `1.0.0`  
**Framework:** Anchor `1.1.2`  
**Token interface:** Solana Token-2022  
**State schema:** `STATE_VERSION_V1 = 1`

The Miner program is the deterministic on-chain settlement kernel for verified PowerChain Proof-of-Energy rewards.

It accepts **verifier-attested evidence summaries**, enforces protocol reward ceilings and emission limits, tracks claimable balances, and transfers pre-funded Token-2022 rewards from a program-controlled treasury vault to the reward owner's token account.

It does not validate raw meter protocols or independently establish physical truth.

## Deployment status

The source currently declares the placeholder program ID:

```text
11111111111111111111111111111111
```

This value must be replaced and synchronized before deployment. Run the repository program-ID synchronization/deployment workflow and verify the resulting manifest before Devnet or Mainnet-Beta use.

## Trust boundary

```text
Meter / EMS
    ↓
Device signed evidence
    ↓
Backend + verifier quorum
    ↓
submit_verified_proof
    ↓
MinerAccount claimable balance
    ↓
approved short-lived claim authorization
    ↓
reward-owner wallet
    ↓
claim_rewards
    ↓
Token-2022 treasury transfer
    ↓
ClaimReceipt PDA
```

The verifier signer is trusted to attest that off-chain evidence validation succeeded. The program still enforces independent bounds on sequence, age, energy, quality, reward rate, per-proof reward, and total emissions.

## PDA namespaces

| PDA | Seeds |
|---|---|
| Protocol config | `['protocol']` |
| Treasury authority | `['treasury-authority']` |
| Treasury vault | `['treasury-vault']` |
| Miner account | `['miner', owner_pubkey]` |
| Device account | `['device', device_signing_key]` |
| Claim receipt | `['claim-receipt', claim_id_16_bytes]` |

The matching TypeScript derivation helpers live in [`packages/powerchain-protocol/miner`](../../packages/powerchain-protocol/miner/README.md).

## Accounts

### `ProtocolConfig`

Stores the protocol-wide authority and economic guardrails:

```text
state_version
authority
pending_authority
verifier
miner_mint
treasury_vault
reward_per_work_unit
max_reward_per_proof
max_energy_wh_per_proof
min_quality_bps
emission_cap
total_rewards_issued
max_proof_age_secs
max_observation_age_secs
max_clock_skew_secs
epoch_seconds
paused
bumps
```

`reward_per_work_unit` is a **maximum protocol rate** per quality-adjusted integer watt-hour. Tenant/client economics are calculated off-chain and may be stricter.

### `MinerAccount`

One PDA per reward-owner wallet:

```text
owner
claimable_rewards
total_rewards_earned
total_rewards_claimed
total_work_units
accepted_proofs
created_at
updated_at
```

### `DeviceAccount`

One PDA per canonical Ed25519 device signing key:

```text
device_signing_key
miner
enabled
last_sequence
last_proof_digest
last_source_hash
total_work_units
accepted_proofs
registered_at
last_seen_at
```

### `ClaimReceipt`

Created once for a claim UUID encoded as 16 bytes:

```text
claim_id
miner
owner
destination
amount
authorization_expires_at
claimed_at
```

Because the account is created with deterministic claim seeds, the same claim ID cannot be settled twice through the same program deployment.

## Instructions

| Instruction | Signer / authority | Purpose |
|---|---|---|
| `initialize_protocol` | protocol authority | initialize config, treasury authority and Token-2022 vault |
| `register_miner` | reward owner | create the owner's MinerAccount PDA |
| `register_device` | protocol authority + owner | bind an enrolled device signing key to a MinerAccount |
| `reassign_device` | protocol authority + new owner | explicitly move a device to another MinerAccount |
| `submit_verified_proof` | configured verifier | accept a verified evidence batch and accrue reward |
| `claim_rewards` | reward owner | transfer claimable Token-2022 rewards and create ClaimReceipt |
| `set_device_enabled` | protocol authority | enable/disable an enrolled device |
| `set_paused` | protocol authority | stop/resume proof and claim settlement |
| `set_verifier` | protocol authority | rotate configured verifier signer |
| `update_reward_policy` | protocol authority | update protocol reward/energy/emission ceilings |
| `update_mining_rules` | protocol authority | update proof-age, observation-age, clock-skew, quality, energy and epoch mining rules |
| `propose_authority` | current authority | begin two-step authority transfer |
| `cancel_authority_transfer` | current authority | clear an unaccepted pending authority transfer |
| `accept_authority` | pending authority | complete authority transfer |


## Ecosystem token support

PowerChain as a platform supports classic SPL Token, Token-2022 and Metaplex metadata
surfaces. The **Miner v1 reward treasury remains intentionally Token-2022-only** so its
existing state/account contract does not change silently under canonical `1.0.0`.

For new multi-standard tokenized assets, use protocol-level token helpers or the CCT program.

Canonical addresses are documented in
[`../../docs/SOLANA-PROGRAMS.md`](../../docs/SOLANA-PROGRAMS.md).

## Proof validation

`submit_verified_proof` accepts:

```rust
SubmitProofArgs {
    sequence,
    observed_at,
    verified_at,
    energy_wh,
    sample_count,
    quality_bps,
    proof_digest,
    previous_digest,
    source_hash,
    reward_base_units,
}
```

The program requires:

- protocol not paused;
- signer equals configured verifier;
- device enabled and bound to supplied MinerAccount;
- sequence greater than the last accepted verified sequence;
- positive energy within `max_energy_wh_per_proof`;
- valid sample count;
- quality within protocol bounds and at/above configured minimum;
- non-zero proof/source digests;
- bounded observation and verification age;
- reward no greater than quality-adjusted protocol ceiling;
- reward no greater than `max_reward_per_proof`;
- cumulative issued reward no greater than `emission_cap`.

### Digest continuity

`previous_digest` remains part of the verifier-attested payload for provenance, but the on-chain program intentionally does **not** require it to equal the last accepted on-chain proof digest. The backend raw evidence chain can contain rejected evidence that is never settled on-chain, so exact raw-chain continuity is enforced off-chain while the program enforces monotonic accepted-proof sequence.

## Reward arithmetic

Quality-adjusted energy is deterministic integer math:

```text
effective_wh = floor(energy_wh × quality_bps / 10_000)
protocol_ceiling = effective_wh × reward_per_work_unit
```

`reward_base_units` is calculated by the backend/evidence policy and must not exceed the on-chain ceiling.

No floating-point arithmetic is used for on-chain rewards.

## Claims

`claim_rewards` requires:

- protocol not paused;
- non-zero 16-byte claim ID;
- authorization expiry not in the past;
- authorization window ≤ `MAX_CLAIM_AUTHORIZATION_SECS` (`3600` seconds);
- configured Token-2022 mint and treasury vault;
- requested amount > 0 and ≤ claimable balance;
- treasury balance sufficient;
- destination token account owned by reward owner;
- destination mint equals configured MINER mint.

`requested_amount = 0` means claim the entire current claimable balance.

The treasury authority PDA signs a `transfer_checked` CPI through the Token-2022 interface.

## Administration

High-consequence administration is intentionally explicit:

- `set_paused` provides protocol emergency pause;
- `set_verifier` rotates the trusted verifier signer;
- `update_reward_policy` cannot lower the emission cap below already issued rewards;
- authority rotation is two-step: `propose_authority` → `accept_authority`.

Production deployments should place protocol authority behind an organizational wallet/multisig and follow the backend approval/audit controls documented in the repository.

## Events

The program emits:

```text
ProtocolInitialized
MinerRegistered
DeviceRegistered
DeviceReassigned
DeviceStatusChanged
ProofAccepted
RewardsClaimed
RewardPolicyUpdated
MiningRulesUpdated
VerifierUpdated
PauseChanged
AuthorityProposed
AuthorityAccepted
AuthorityTransferCancelled
```

These events complement, but do not replace, backend transaction verification and accounting reconciliation.

## Build and test

From the repository root:

```bash
cargo fmt --all -- --check
cargo test --workspace
anchor build
anchor test
```

The JavaScript workspace uses pnpm `11.23.0`, while Anchor's test script delegates to pnpm for TypeScript integration tests.

## Program-ID synchronization

Before deployment:

1. generate/deploy the program keypair;
2. set the real `declare_id!` value;
3. update both Devnet and Mainnet sections of `Anchor.toml` as appropriate;
4. update backend/program environment variables;
5. update SDK/deployment manifests;
6. rebuild the IDL;
7. run deployment verification;
8. run Devnet integration tests before Mainnet-Beta.

Never deploy while `declare_id!` is the system-program placeholder.

## Related documentation

- [`../../docs/PROOF-OF-ENERGY.md`](../../docs/PROOF-OF-ENERGY.md)
- [`../../docs/CHAIN-BINDING.md`](../../docs/CHAIN-BINDING.md)
- [`../../docs/CLAIM-SETTLEMENT-v1.md`](../../docs/CLAIM-SETTLEMENT-v1.md)
- [`../../docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md)
- [`../../packages/powerchain-protocol/miner/README.md`](../../packages/powerchain-protocol/miner/README.md)
- [`../../packages/miner-sdk/README.md`](../../packages/miner-sdk/README.md)
