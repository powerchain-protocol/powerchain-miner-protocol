# ACP Paid Subscription Checkout

Terminal-only workflow for a locally authorized agent that must prepare or complete a paid
subscription checkout using PowerChain ACP tooling.

## Preconditions

Require local availability of:

```text
acp-cli
browser/checkout automation approved by the operator
agent wallet/card issuance capability
PowerChain Agent Compute credentials when model work is required
```

Do not assume these capabilities exist in Claude Desktop or browser-only agents.

## Control rule

A model recommendation is not payment authorization.

Before any irreversible purchase or subscription:

```text
offer / amount / recurrence
        ↓
merchant + checkout verification
        ↓
explicit applicable wallet/card policy
        ↓
human or authorized AgentOS approval
        ↓
payment execution
        ↓
redacted evidence
```

## Desktop-safe handoff

When the runtime cannot access local checkout controls, stop before payment and produce a
handoff containing:

- merchant;
- plan;
- currency;
- recurring amount;
- billing interval;
- checkout URL;
- required local command/workflow;
- expiration or quote validity if known.

Never claim that payment completed from a Desktop/web-only handoff.

## Evidence

Retain only redacted evidence necessary to prove the action:

```text
merchant
plan
amount/currency
timestamp
transaction/order reference
last four digits or wallet public address when appropriate
status
```

Never include:

- full card number;
- CVV;
- seed phrase;
- private key;
- full session cookie;
- compute API secret.

## Compute

If compute is required during checkout, use `acp-builder-setup` first and validate the model
with live `/models`.

## Failure mode

If merchant, amount, recurrence, funding source, or authorization is ambiguous, do not
execute payment. Produce a handoff/review state instead.
