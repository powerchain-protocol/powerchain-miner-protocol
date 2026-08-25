# Reward Claim Approval Policy

Canonical product version: `1.0.0`.

Reward claims separate four authorities:

```text
requester
  ↓
client-scoped approver quorum
  ↓
reward-owner wallet authorization
  ↓
on-chain settlement + API reconciliation
```

## Default policy

Without a client-specific policy, a new claim snapshots:

```text
required roles: FINANCE
required approvals: 1
```

The requester can never approve their own claim.

SuperAdmin is deliberately **not** substituted for a client-scoped approval role.

## High-value policy

Client Admins may configure:

```http
GET /api/v1/clients/:clientId/reward-claim-approval-policy
PUT /api/v1/clients/:clientId/reward-claim-approval-policy
```

A policy can define a base-unit threshold and distinct roles for normal/high-value claims.
For example:

```text
normal:     FINANCE
high value: FINANCE + CLIENT_ADMIN
```

When the claim is created, the active policy is snapshotted onto that claim. Later policy
changes do not silently weaken an already-requested claim.

## Approval records

Each approval is stored in `reward_claim_approvals` with unique constraints for:

```text
claim + approver user
claim + approver role
```

This prevents one user from supplying multiple approvals and prevents two Finance approvals
from masquerading as a Finance + Client Admin quorum.

The claim remains `REQUESTED` until every required role is satisfied. Only then does it move
to `APPROVED` and become eligible for wallet preparation.

## Observability

Prometheus exports:

```text
powerchain_miner_pending_claim_approvals
```
