# @powerchain/miner-sdk

Canonical TypeScript SDK for the PowerChain Miner Anchor program.

## Capabilities

- derive ProtocolConfig / treasury / MinerAccount / DeviceAccount / ClaimReceipt PDAs;
- load the Anchor IDL and verify its address;
- initialize protocol state;
- register a reward-owner MinerAccount;
- register a device against its Ed25519 signing public key;
- inspect derived state.

The SDK uses the Anchor 1.x TypeScript package `@anchor-lang/core` together with legacy
`@solana/web3.js` v1 and Token-2022 helpers.

## Commands

```bash
pnpm miner:initialize -- <env-file>
pnpm miner:register-owner -- <env-file>
pnpm miner:register-device -- <env-file>
pnpm miner:reassign-device -- <env-file>
pnpm miner:inspect -- <env-file>
```

These file-keypair scripts are intended for Devnet/bootstrap administration. Mainnet owner
registration should use an approved user-wallet or organizational signing flow.


## Device owner change

Changing the off-chain reward owner invalidates chain binding. Use the explicit
`reassign_device` instruction after the new owner has a MinerAccount.

Both protocol authority and the new owner sign the reassignment. The backend subsequently
decodes the DeviceAccount and MinerAccount data before marking chain binding VERIFIED.
