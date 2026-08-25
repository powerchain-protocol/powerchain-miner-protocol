# Command Reference

## Node

```bash
minerctl status
minerctl health
minerctl logs
minerctl restart
minerctl queue
minerctl state
minerctl identity
```

## Repository

```bash
./scripts/bootstrap-dev.sh
./scripts/check.sh
./scripts/test.sh
./scripts/build.sh
./scripts/devnet-up.sh
./scripts/mainnet-preflight.sh
```

## Solana

```bash
./scripts/sync-program-id.sh
./scripts/create-miner-token.sh
./scripts/deploy-miner.sh
./scripts/finalize-genesis.sh
```


## Evidence verifier

```bash
corepack pnpm verifier:keygen
```

Generates an Ed25519 private/public PEM pair under ignored `target/keys/` paths by default.
Register only the public key with the control plane.


## Miner program administration

```bash
corepack pnpm miner:initialize -- <env-file>
corepack pnpm miner:register-owner -- <env-file>
corepack pnpm miner:register-device -- <env-file>
corepack pnpm miner:reassign-device -- <env-file>
corepack pnpm miner:inspect -- <env-file>
```

The file-keypair registration/reassignment commands are for controlled Devnet/bootstrap
administration. Mainnet user ownership changes should use an approved wallet or governed
signing flow.
