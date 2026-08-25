# Publishing `@powerchain-protocol/miner`

**Canonical package version:** `1.0.0`

## Security rule

Do not commit or paste npm access tokens into:

- `.npmrc`;
- `.env`;
- shell scripts;
- Docker build arguments;
- GitHub Actions YAML;
- documentation;
- issue/chat text.

The repository secret scanner rejects common npm token patterns.

## Build and inspect

```bash
corepack pnpm package:miner:build
corepack pnpm package:miner:inspect
```

The package publishes compiled ESM and declaration files from `dist/`.

## Initial publish

A package must exist before npm Trusted Publishing can be configured. For the first publish,
use an interactive local npm login protected by 2FA:

```bash
npm login
corepack pnpm package:miner:publish
```

The publish script refuses environment-token publishing and refuses to republish an npm
version that already exists.

## Trusted Publishing

After the package exists, configure npm Trusted Publishing for:

```text
organization: powerchain-protocol
repository:   powerchain-miner-protocol
workflow:     publish-miner.yml
```

The workflow uses GitHub OIDC (`id-token: write`) and does not require a long-lived npm
publish token.

## Canonical 1.0.0 policy

npm package versions are immutable. If `@powerchain-protocol/miner@1.0.0` already exists,
the repository must not overwrite it. Keep source product branding canonical at `1.0.0`, but
choose a new registry version only when a future npm artifact must actually differ from the
already-published tarball.
