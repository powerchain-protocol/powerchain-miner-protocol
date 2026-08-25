# Canonical Dependency Baseline

**Product version:** `1.0.0`  
**Package manager:** `pnpm 11.23.0`  
**Node.js:** `24.19.0 LTS`

The product version remains `1.0.0`; dependency maintenance does not change the public
protocol/product version.

## Runtime/tooling

| Package | Canonical version | Rationale |
|---|---:|---|
| pnpm | `11.23.0` | current stable pnpm 11 |
| Node.js | `24.19.0` | current Node 24 LTS used by the repo and Docker |
| TypeScript | `5.9.3` | current stable 5.x toolchain compatible with the workspace |
| tsx | `4.23.12` | current stable runtime for backend TypeScript execution |

## Web

| Package | Canonical version |
|---|---:|
| Next.js | `16.3.2` |
| React | `19.2.8` |
| React DOM | `19.2.8` |
| @types/react | `19.2.18` |
| @types/react-dom | `19.2.5` |

## Backend

| Package | Canonical version |
|---|---:|
| Fastify | `5.12.1` |
| @fastify/cors | `11.3.0` |
| @fastify/jwt | `10.2.2` |
| @fastify/rate-limit | `11.2.0` |
| Zod | `4.4.3` |
| pg | `8.23.0` |
| @types/pg | `8.23.1` |
| prom-client | `15.1.3` |

`@fastify/cors` 11 uses safer default methods, so the backend explicitly declares the REST
methods it supports.

## Solana

| Package | Canonical version |
|---|---:|
| @solana/web3.js | `1.98.4` |
| @powerchain-protocol/miner token client | canonical SPL/Token-2022 wire helpers; no legacy `@solana/spl-token` npm dependency |
| @anchor-lang/core | `1.1.2` |

The repository intentionally stays on the maintained `@solana/web3.js` 1.x line because the
current Miner SDK and SPL Token client use that API. Migration to `@solana/kit` is a separate
breaking architectural change, not a routine dependency bump.

## Mobile

| Package | Canonical version |
|---|---:|
| Expo | `57.0.16` |
| React Native | `0.86.3` |
| React | `19.2.3` |

Expo SDK 57 targets React Native 0.86 and React 19.2.3. The mobile app therefore stays on the
latest compatible 0.86 patch instead of jumping to React Native 0.87 independently.

## Docker

| Image/tool | Canonical version |
|---|---:|
| Node image | `node:24.19.0-bookworm-slim` |
| PostgreSQL image | `postgres:17.11-alpine3.24` |
| pnpm in image | `11.23.0` |

See `docker/README.md`.
