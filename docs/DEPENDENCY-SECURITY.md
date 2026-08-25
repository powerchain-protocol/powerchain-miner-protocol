# Dependency Security Baseline

**Canonical product version:** `1.0.0`  
**Policy date:** 2026-08-25

This repository fails closed on the dependency families implicated by the August 2026
Dependabot alerts.

## Python cryptography

The Device Agent pins:

```text
cryptography==50.0.0
```

This baseline covers the current advisories that require 48.0.1, 49.0.0 and 50.0.0.
The Device Agent currently uses Ed25519 key serialization/signing, not PKCS#7 decryption or
X.509 path building, but the vulnerable wheel is not accepted merely because those APIs are
not on the normal path.

## uuid

Transitive packages in the Expo/Solana toolchain historically request uuid 7.x/8.x. The root
pnpm policy forces vulnerable pre-11 releases to `11.1.1`, while exact vulnerable 12.0.0 and
13.0.0 are redirected to their patched patch releases.

`uuid@11.1.1` is used as the compatibility floor because it contains the bounds fix and still
supports CommonJS consumers used by older tooling.

## bigint-buffer

`bigint-buffer <=1.1.5` has no patched upstream release. It entered the workspace through:

```text
@solana/spl-token
  -> @solana/buffer-layout-utils
  -> bigint-buffer
```

PowerChain therefore does not override it to an unofficial fork. The JavaScript workspace has
removed direct `@solana/spl-token` usage and implements the limited required SPL/Token-2022
client primitives in:

```text
@powerchain-protocol/miner/solana
```

The on-chain SPL Token and Token-2022 program IDs and wire formats are unchanged. Anchor's
Rust `anchor-spl` dependency is unrelated to the vulnerable npm package.

## Required lockfile refresh

After applying this policy to an existing checkout:

```bash
corepack enable
corepack prepare pnpm@11.23.0 --activate
corepack pnpm deps:refresh-lockfile
corepack pnpm deps:security
```

Commit the resulting `pnpm-lock.yaml`. Dependabot evaluates the committed lockfile, so source
manifest changes alone do not close lockfile alerts.
