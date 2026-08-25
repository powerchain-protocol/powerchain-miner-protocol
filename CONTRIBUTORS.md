# Contributors

PowerChain Renewable Miner OS is maintained as part of the **PowerChain Protocol** project.

This exported source tree does not include Git history, so individual contributor names cannot be reconstructed reliably from the repository snapshot. This file therefore records the contributor policy without inventing attribution.

## Maintainers

**PowerChain Protocol maintainers** own the canonical `1.0.0` release contract, including:

- protocol architecture and trust boundaries;
- Solana program and deployment policy;
- backend/API schemas and database migrations;
- Agent Compute control/data planes;
- device-agent and evidence-verifier behavior;
- security/release gates;
- canonical documentation and versioning.

## Contributor recognition

A contributor should be added here after a contribution is verifiably accepted through project history, such as a merged pull request or signed release record.

Recommended format:

```text
Name / handle — area of contribution — first accepted contribution
```

Examples of contribution areas:

```text
Anchor / Solana
Backend / PostgreSQL
Proof-of-Energy / device agent
Evidence verification
Agent Compute
Web / mobile UI
Security / review
Documentation
Testing / infrastructure
Integrations
```

## Contribution standard

Contributors are expected to preserve the canonical control principle:

> Physical systems provide truth. Evidence establishes trust. Policy calculates economics. Humans approve high-consequence actions. Wallets authorize. Solana settles. Ledgers reconcile and audit.

Changes must not silently weaken authority separation, evidence requirements, integer financial arithmetic, or settlement verification.

## Attribution and generated assistance

When automated or AI-assisted tooling materially contributes to a change, the human contributor remains responsible for reviewing the generated output, tests, security implications, licensing, and final commit. Automated tools are not listed as project contributors in place of accountable human maintainers.

## How to contribute

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for workflow, validation, documentation, and security expectations.
