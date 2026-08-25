# Canonical MINER Claim Settlement — v1.0

PowerChain Miner v1.0 uses one settlement model:

```text
verified Proof of Energy
        ↓
reward ledger accrual
        ↓
member claim request
        ↓
independent Finance approval
        ↓
short-lived claim authorization prepared
        ↓
reward owner signs claim_rewards
        ↓
Miner program transfers Token-2022 from program treasury vault
        ↓
one-time ClaimReceipt PDA
        ↓
API independently reconciles transaction
        ↓
CONFIRMED + append-only settlement ledger
```

## Authority boundary

The backend does **not** sign a user's claim transaction.

The browser does **not** receive:
- the verifier signer;
- treasury authority;
- program upgrade authority;
- evidence-verifier private keys.

The reward owner signs with their configured Solana wallet.

## ClaimReceipt replay protection

For each database claim UUID:

```text
claimReceipt =
PDA("claim-receipt", uuid_bytes)
```

`claim_rewards` initializes the PDA. A second transaction for the same claim ID cannot
initialize the same receipt again.

The receipt records:

- claim ID;
- MinerAccount;
- reward owner;
- destination token account;
- amount;
- authorization expiry;
- claim timestamp;
- state version.

## Short-lived authorization

The prepared instruction includes:

```text
expires_at
```

The program accepts at most a one-hour authorization window. The control plane currently
prepares a 15-minute window.

A prepared claim is not cancelled from database time alone. Cancellation requires:

1. authorization expiry;
2. an additional safety window;
3. a finalized Solana query proving the ClaimReceipt is still absent.

After that point the old signed transaction is expired at the program layer, so the
off-chain hold can be released safely.

## Preparation

```text
POST /api/v1/reward-claims/:claimId/prepare
```

The API derives and checks:

- ProtocolConfig PDA and v1 state version;
- ProtocolConfig MINER mint and treasury-vault identity;
- MinerAccount PDA and owner;
- **on-chain claimable balance** for the approved amount;
- treasury authority PDA;
- program treasury Token-2022 mint, authority and available balance;
- Token-2022 associated account for the reward owner;
- ClaimReceipt PDA;
- Miner program ID;
- MINER mint.

Solana RPC work is performed outside the database transaction. The final database update is
a compare-and-set operation, so a slow RPC does not hold claim or membership row locks.

## Browser execution

The console:

1. connects Phantom, Solflare, Backpack, or another compatible injected Solana wallet;
2. requires the connected wallet to equal the configured reward owner;
3. creates the Token-2022 ATA idempotently if it does not exist;
4. adds the prepared `claim_rewards` instruction;
5. submits the transaction;
6. waits for confirmation;
7. asks the backend to reconcile the signature.

## Reconciliation

```text
POST /api/v1/reward-claims/:claimId/settled
```

The backend independently verifies:

- transaction exists and succeeded;
- expected ClaimReceipt PDA is in the transaction;
- configured Miner program was invoked;
- Token-2022 transfer source is the configured program treasury vault;
- destination is the prepared owner token account;
- mint is the configured MINER mint;
- amount equals the approved claim;
- ClaimReceipt exists after confirmation and is owned by the Miner program.

Only then does the claim become `CONFIRMED`.
