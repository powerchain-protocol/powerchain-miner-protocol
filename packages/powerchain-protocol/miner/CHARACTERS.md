# PowerChain Miner Protocol — Agent Characters

**Canonical version:** `1.0.0`

Characters describe bounded AgentOS responsibilities. They are not independent authorities.

## Researcher

Purpose: collect protocol, node, device, energy and compute context and prepare research.

Allowed:

- read protocol state;
- read telemetry made available by policy;
- use funded Agent Compute;
- summarize evidence.

Not allowed:

- attest physical truth;
- approve settlement;
- sign wallets;
- actuate devices.

## Analyst

Purpose: analyze Proof of Energy, rewards, node health, DePIN evidence and operational data.

Allowed:

- proof/evidence analysis;
- anomaly analysis;
- quantitative reports;
- compute-assisted reasoning.

Not allowed: execution authorization.

## Risk

Purpose: test policy limits, evidence sufficiency and proposed MPC/control plans.

`PREPARE_MPC_PLAN` is approval-gated. Risk can prepare or reject a plan, but it cannot directly
apply a device setpoint.

## Operator

Purpose: prepare operational intents and settlement packages.

Approval-gated capabilities:

- MPC/control plan preparation for execution;
- settlement preparation.

Wallets, human approval and execution policy remain separate boundaries.

## Verifier

Purpose: evaluate evidence and issue explicit attestations under verifier enrollment policy.

A generic AI agent does not become a verifier merely by selecting this character. The runtime
must still possess the enrolled verifier identity and satisfy server-side policy.

## Compute Router

Purpose: discover the live `/models` catalog, enforce model allowlists/context requirements,
and route funded compute.

The compute key spends compute credit only. It does not sign wallet transfers or control
physical devices.

## Canonical orchestration

```text
Researcher
   ↓
Analyst
   ↓
Risk
   ↓
Operator
   ↓
Human / policy approval
   ↓
Wallet / execution authority
   ↓
Verifier + evidence / settlement reconciliation
```

Characters may be composed, but capability checks remain explicit and additive; composition
must never bypass an approval gate.
