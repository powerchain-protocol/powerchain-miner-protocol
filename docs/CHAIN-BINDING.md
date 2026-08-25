# Device ↔ Solana Chain Binding

Version 0.8 removes user-supplied PDA mappings from Raspberry Pi enrollment.

## Canonical device identity

The node owns one local Ed25519 key.

It enrolls with both:

```text
publicKeyPem
publicKeyRawBase64
```

The backend extracts the raw Ed25519 key from the PEM and requires it to exactly match the
32-byte raw value.

Those 32 bytes are also a valid Solana `Pubkey`.

## Deterministic PDAs

Given the configured Miner program:

```text
DeviceAccount PDA
= PDA("device", device_ed25519_pubkey)

MinerAccount PDA
= PDA("miner", owner_solana_wallet)
```

The node is not allowed to choose either address.

## Ownership boundary

The Raspberry Pi also cannot assign its reward owner during enrollment.

Client Admin:

1. assigns an active client member;
2. configures that member's canonical Solana reward wallet;
3. asks the backend for the expected PDA mapping;
4. creates/registers the required on-chain accounts using the approved Solana workflow;
5. runs chain-binding verification.

## Verification

`POST /api/v1/clients/:clientId/devices/:deviceId/chain-binding/verify`

The backend:

1. re-derives both PDAs;
2. queries Solana using `POWERCHAIN_SOLANA_RPC_URL`;
3. requires both accounts to exist;
4. requires both accounts to be owned by `POWERCHAIN_MINER_PROGRAM_ID`;
5. re-derives the mapping inside the persistence transaction;
6. stores the mapping as `VERIFIED`.

The settlement worker ignores a device unless:

```text
chain_binding_status = VERIFIED
```

Changing the assigned owner or that member's reward wallet automatically invalidates the
stored binding.


## Reward owner changes

A DeviceAccount stores its assigned MinerAccount on-chain. Changing the off-chain device
owner therefore cannot be completed by merely deriving another Miner PDA.

v1 uses:

```text
authority
+
new reward-owner signer
        ↓
reassign_device
        ↓
DeviceAccount.miner = new MinerAccount
```

Then run chain-binding verification again.

The API decodes v1 DeviceAccount/MinerAccount data and verifies:

- account discriminator;
- state version;
- device signing public key;
- DeviceAccount → MinerAccount relationship;
- MinerAccount → owner wallet relationship.

Program ownership alone is not considered a valid binding.
