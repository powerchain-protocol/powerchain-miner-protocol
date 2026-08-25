# PowerChain Docker

Canonical Docker assets for PowerChain Renewable Miner OS + Agent Compute `1.0.0`.

## Images

The workspace image is built from:

```text
node:24.19.0-bookworm-slim
corepack pnpm 11.23.0
```

PostgreSQL uses the explicit supported patch image:

```text
postgres:17.11-alpine3.24
```

## Start the core stack

```bash
cp docker/.env.example docker/.env
# edit docker/.env
corepack pnpm docker:up
```

Core services:

```text
postgres   5432
backend    3100
console    3000
frontend   3002
```

Agent Compute is opt-in because it requires a real upstream compute credential:

```bash
corepack pnpm docker:compute
```

Expo/Metro is also opt-in:

```bash
corepack pnpm docker:mobile
```

## Database lifecycle

The backend container waits for the PostgreSQL healthcheck through Compose dependencies and
runs migrations before starting. Development seed data is controlled by:

```text
POWERCHAIN_RUN_SEED=true|false
```

The default Compose stack enables seed data for local development only.

## Production rules

Do not use the development secrets from `docker/.env.example` in production.

For a production deployment:

- provide secrets from the orchestrator/secret manager;
- set `POWERCHAIN_RUN_SEED=false`;
- configure a production PostgreSQL service or managed database;
- set explicit Solana/Helius endpoints and program/mint addresses;
- set the real `CORS_ORIGINS` values;
- keep the app containers non-root with `no-new-privileges` and all Linux capabilities dropped;
- commit `pnpm-lock.yaml` and use frozen installs.

The Docker build intentionally fails during `typecheck` or Next.js production build rather
than shipping an image with known TypeScript/build errors.


## Related documentation

- [Root README](../README.md)
- [Installation](../docs/INSTALLATION.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)
- [Deployment](../docs/DEPLOYMENT.md)
