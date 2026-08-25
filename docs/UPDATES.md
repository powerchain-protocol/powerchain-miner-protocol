# Signed Node Updates

A release manifest contains version, channel, platform, architecture, artifact URL,
artifact SHA-256 and an Ed25519 manifest signature.

Use:

```bash
minerctl update-check
```

The node verifies the manifest with the locally configured release public key. Downloaded
artifacts are retained only when their SHA-256 matches the signed manifest.

The base implementation does not automatically install remote artifacts. Production rollout
should add an explicit signed install/rollback policy.
