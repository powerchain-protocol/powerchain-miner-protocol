# PowerChain Miner — Security Model

## Canonical control principle

Hardware produces measurements. The verifier validates device signatures and evidence.
The on-chain program enforces reward policy. The treasury settles MINER rewards.
No Raspberry Pi holds protocol, mint, treasury, or upgrade authority.

## Mainnet invariants

1. Use a separate mainnet-beta program keypair generated offline.
2. Never commit program, authority, verifier, or deployer private keys.
3. Prefer multisig governance for protocol authority and upgrade authority.
4. Use a dedicated verifier signer with narrow operational permissions.
5. Device keys are identity keys only. A compromised Pi must not control treasury funds.
6. MINER is fixed-supply after genesis: mint authority is revoked.
7. `emission_cap` must never exceed the funded reward treasury.
8. Proofs use monotonically increasing device sequences.
9. The verifier must validate the exact canonical digest signed by the device before
   submitting `submit_verified_proof`.
10. Pause the protocol on verifier compromise, accounting drift, replay anomalies,
    or treasury inconsistency.
11. Deploy through a private/dedicated mainnet RPC and verify the deployed binary.
12. Mainnet activation requires tests, independent review, reproducible build/verification,
    authority inspection, treasury reconciliation, and incident runbooks.

## Device proof recommendation

Canonical payload:

- protocol version
- cluster/domain separator
- program id
- device public key
- miner account
- sequence
- observed timestamp
- measurement type
- integer work units
- source meter/device id
- previous proof hash
- nonce

Hash the canonical binary encoding, then sign the digest with the Raspberry Pi's Ed25519
device identity key. The verifier checks signature, enrollment, time window, monotonic
sequence, measurement policy, duplicate evidence, and any external meter/telemetry evidence.

The current on-chain program intentionally requires the verifier signer rather than parsing
raw device signatures on-chain. A later hardening release can require an Ed25519
precompile verification instruction in the same Solana transaction.


## v0.6 trust boundaries

A valid Raspberry Pi Ed25519 signature proves **device identity and message integrity**.
It does not independently prove that a meter value is physically correct.

The production trust chain is therefore:

```text
device identity
    ↓
signed evidence receipt
    ↓
independent evidence attestation / quorum
    ↓
reward policy calculation
    ↓
settlement verifier
    ↓
Solana program safety ceiling
    ↓
treasury-backed claim
```

### Separate credentials

Use independent credentials for:

- client device enrollment;
- Raspberry Pi device identity;
- evidence-verifier service;
- settlement-verifier service;
- platform SuperAdmin;
- treasury/multisig;
- Solana program upgrade authority;
- signed software-release authority.

Do not reuse a single private key across these trust domains.

### Reward safety

- `PENDING` proofs create no spendable reward.
- verified reward ownership must map to an explicit active client member.
- proof accrual is unique by `proof_id`.
- claim holds and settlements are unique by `claim_id`.
- backend reward amount is checked by an on-chain protocol ceiling and emission cap.
- settlement workers consume only `VERIFIED` evidence.


## v0.8 verifier identity

Automated evidence attestations now require two independent controls:

1. the evidence-worker API token;
2. a registered Ed25519 verifier private key.

The API verifies the signature against a client-scoped public-key registry and the proof's
verification-policy assignment.

This prevents a leaked shared worker token from impersonating multiple quorum members.

## v0.8 chain binding

Raspberry Pi enrollment no longer accepts economic ownership or arbitrary PDA mappings.

The backend derives PDAs from:

- the device's Ed25519 identity;
- the assigned member's canonical Solana reward wallet; and
- the configured Miner program ID.

The binding becomes eligible for settlement only after Solana confirms both PDAs exist and
are program-owned.


## v1.0 claim authority

Finance approves an off-chain claim but cannot spend the member's claim by itself.

The reward owner signs the canonical Anchor `claim_rewards` transaction. The Miner program
transfers MINER from the program-owned treasury vault and creates a one-time ClaimReceipt.

The API reconciles the resulting transaction; it does not sign it.

This separates:

```text
economic approval
≠
user authorization
≠
program execution
≠
backend reconciliation
```

Claim preparation is short-lived. Cancellation is blocked while an authorization remains
valid to avoid releasing an off-chain hold while a signed transaction could still execute.

## v1.0 immutable records

`reward_ledger` and application-level `audit_logs` reject UPDATE and DELETE operations at the
database trigger layer.

Corrections to economic history must use compensating ledger entries rather than rewriting
existing rows.

Audit checkpoints should be exported to an independent retention system for stronger
protection against whole-database replacement.

## v1.0 release identity

The repository placeholder program ID is deliberately non-deployable. Production release
gates must verify:

- real program ID;
- matching `declare_id!`;
- matching `Anchor.toml`;
- matching deployment manifest;
- MINER mint;
- program treasury vault;
- verifier identity;
- verified deployment state.
