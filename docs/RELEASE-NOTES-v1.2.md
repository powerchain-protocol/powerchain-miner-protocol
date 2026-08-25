# PowerChain Renewable Miner OS / AgentOS Compute v1.2.0

v1.2 adds Agent Compute without changing the canonical v1 Proof-of-Energy or MINER
settlement trust model.

## New data plane

```text
apps/compute
https://compute.powerchain.energy/v1
```

Supported endpoints:

- `GET /v1/models`
- `GET /v1/account`
- `POST /v1/chat/completions`
- `POST /v1/responses`
- `POST /v1/topups/:intentId/confirm`

## Wallet-funded compute

Each AgentOS agent has:

- one agent wallet;
- one compute account;
- zero or more scoped compute API keys;
- append-only credit/usage ledger;
- in-flight usage reservations;
- optional bounded auto-top-up policy.

## Billing safety

Before compute executes, the backend reserves the conservative maximum request cost.

After a successful provider response, returned token usage becomes an append-only
`USAGE_DEBIT`.

Provider failures release the reservation.

Streaming is deliberately rejected in v1.2 because durable post-stream billing
reconciliation is not yet implemented.

## Auto-top up

Low balance can create a quoted wallet-payment intent containing:

- preferred chain;
- asset/mint;
- treasury destination;
- exact asset base units;
- expiry.

The compute API key cannot sign the transfer.

The AgentOS wallet policy signs, then the compute endpoint independently verifies the
Solana transfer before issuing `TOPUP_CREDIT`.

## Local developer adapters

- Codex/OpenAI-style local proxy;
- basic Claude Code `/v1/messages` adapter.

Advanced streaming and Anthropic tool-block translation intentionally fail closed.

## New package

`@powerchain/agent-compute` contains:

- API key primitives;
- pricing arithmetic;
- request validation;
- Solana top-up transaction construction;
- top-up confirmation client.

## Database

Migration:

```text
008_v120_agent_compute.sql
```

adds:

- agents;
- compute accounts;
- compute API keys;
- model rates;
- usage authorizations;
- append-only compute ledger;
- funding assets;
- wallet top-up intents;
- derived compute balances.
