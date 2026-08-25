# PowerChain Documentation

Canonical product version: `1.0.0`.

## Start here

- [Root README](../README.md)
- [Installation](INSTALLATION.md)
- [Developer Guide](DEVELOPER-GUIDE.md)
- [Operator Guide](OPERATOR-GUIDE.md)
- [User Guide](USER-GUIDE.md)
- [Troubleshooting](TROUBLESHOOTING.md)

## Architecture and protocol

- [Renewable Miner Architecture](RENEWABLE-MINER-ARCHITECTURE.md)
- [Miner Anchor Program](../programs/miner/README.md)
- [Canonical Miner Protocol Package](../packages/powerchain-protocol/miner/README.md)
- [Proof of Energy](PROOF-OF-ENERGY.md)
- [Control Plane Boundaries](CONTROL-PLANE.md)
- [Logic & Functions](LOGIC-FUNCTIONS.md)
- [Device ↔ Solana Chain Binding](CHAIN-BINDING.md)
- [Claim Settlement v1](CLAIM-SETTLEMENT-v1.md)

## Evidence, rewards and audit

- [Backend, RBAC & Rewards](BACKEND-RBAC-REWARDS.md)
- [Evidence Verification](EVIDENCE-VERIFICATION.md)
- [Signed Attestation & Quorum](ATTESTATION-QUORUM.md)
- [Settlement Verification](SETTLEMENT-VERIFICATION.md)
- [Proof Settlement Leases & Durable Intents](SETTLEMENT-LEASES.md)
- [Reward Claim Approval Policy](CLAIM-APPROVALS.md)
- [Financial Idempotency](FINANCIAL-IDEMPOTENCY.md)
- [Tamper-Evident Audit Integrity](AUDIT-INTEGRITY.md)
- [Meter / EMS Source Rotation](SOURCE-ROTATION.md)

## Agent Compute and agents

- [Agent Compute](AGENT-COMPUTE.md)
- [Available Models](AVAILABLE-MODELS.md)
- [Agent Setup](AGENT-SETUP.md)
- [Shared Skills](../skills/README.md)

## Applications and design

- [Monorepo](MONOREPO.md)
- [Design Guide](DESIGN-GUIDE.md)
- [Docker](../docker/README.md)
- [Integrations & EMS](INTEGRATIONS.md)

## Operations and release

- [Security](SECURITY.md)
- [Observability](OBSERVABILITY.md)
- [Signed Updates](UPDATES.md)
- [Linux](LINUX.md)
- [Commands](COMMANDS.md)
- [Testing](TESTING.md)
- [Deployment](DEPLOYMENT.md)
- [Dependency Baseline](DEPENDENCIES.md)
- [Canonical v1.0.0 Release Notes](RELEASE-NOTES-v1.0.0.md)
- [Changelog](../CHANGELOG.md)

## Migration history

Migration documents are retained as internal schema/protocol evolution history. They do not change the public product version.

- [v0.4](MIGRATION-v0.4.md)
- [v0.5](MIGRATION-v0.5.md)
- [v0.6](MIGRATION-v0.6.md)
- [v0.7](MIGRATION-v0.7.md)
- [v0.8](MIGRATION-v0.8.md)
- [v0.9](MIGRATION-v0.9.md)
- [v1.0](MIGRATION-v1.0.md)

## Network isolation rule

Devnet and Mainnet-Beta must use separate program IDs, reward mints, treasuries, verifier identities, RPC configuration, and deployment manifests.
