# @powerchain/miner-sdk

**Version:** `1.0.0`

Administrative TypeScript SDK for the PowerChain Miner Anchor program.

The SDK consumes and re-exports canonical protocol primitives from [`@powerchain-protocol/miner`](../powerchain-protocol/miner/README.md); it should not define competing PDA seeds or reward math.

## Capabilities

- derive ProtocolConfig, treasury, MinerAccount, DeviceAccount and ClaimReceipt PDAs;
- load/verify Anchor IDL and program address;
- initialize protocol configuration;
- register reward-owner MinerAccount;
- register/reassign devices;
- inspect program state.

## Commands

```bash
corepack pnpm miner:initialize -- <env-file>
corepack pnpm miner:register-owner -- <env-file>
corepack pnpm miner:register-device -- <env-file>
corepack pnpm miner:reassign-device -- <env-file>
corepack pnpm miner:inspect -- <env-file>
```

File-keypair administration is intended for controlled bootstrap/Devnet workflows. Mainnet owner and authority operations should use approved user or organizational signing flows.

## Device reassignment

Changing the off-chain reward owner invalidates chain binding. Use the explicit `reassign_device` instruction after the new owner has a MinerAccount. Both protocol authority and the new owner sign the reassignment; the backend then independently decodes program accounts before marking binding verified.
