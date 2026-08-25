# PowerChain Miner Protocol Skills

**Canonical version:** `1.0.0`

This file defines the skill contract for `@powerchain-protocol/miner`.

## Principle

Skills are capabilities, not authorities.

```text
physical systems provide truth
        ↓
skill reads bounded context
        ↓
agent analyzes / prepares intent
        ↓
policy + human review where required
        ↓
wallet / execution authority authorizes
        ↓
blockchain / device execution
        ↓
evidence + ledger
```

A skill must never silently elevate itself into:

- treasury authority;
- Solana program upgrade authority;
- device private-key custody;
- verifier authority unless the runtime is explicitly enrolled as a verifier;
- direct MPC/device actuation authority;
- unrestricted wallet spending.

## Manifest

Runtime type: `MinerSkillManifest` from `@powerchain-protocol/miner/skills`.

Required fields:

```text
id
name
version = 1.0.0
description
runtimes[]
requiredCapabilities[]
terminalOnly?
```

## Canonical skill domains

```text
protocol-state
nodes
depin-evidence
solana
helius
iot-devices
iot-hardware
iot-firmware
compute
llm-routing
mpc-planning
agent-operations
```

## Runtime rules

### AgentOS

May use connected protocol, telemetry, compute and wallet services only through explicit
runtime permissions.

### Codex

Use project/user skills for code and operational preparation. Codex configuration must not
contain wallet private keys or plaintext provider secrets beyond environment-variable names.

### Claude Code

Use local skills and router configuration. Terminal-only skills remain terminal-only.

### Desktop/web

Use uploadable/document-safe skills. Do not assume local CLI, browser automation, wallet
signer, serial port, Modbus device, or filesystem access.

## Evidence

A skill performing high-consequence analysis should return references to its evidence and
state the distinction between:

```text
observed fact
inference
recommendation
authorized action
```

## Versioning

The public package remains canonical `1.0.0`. New skill capabilities are added without
inventing `1.1`, `1.2`, or `1.3` public product versions.
