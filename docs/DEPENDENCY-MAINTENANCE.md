# Dependency Maintenance

**Canonical product version:** `1.0.0`  
**Package manager:** `pnpm 11.23.0`

## Canonical command path

Use Corepack so a stale globally installed pnpm cannot control workspace behavior:

```bash
corepack enable
corepack pnpm --version
corepack pnpm install
corepack pnpm update
```

The repository pins:

```json
{
  "packageManager": "pnpm@11.23.0",
  "engines": {
    "pnpm": "11.23.0"
  }
}
```

Root package scripts also invoke `corepack pnpm` internally.

## Peer dependency warnings

Run:

```bash
corepack pnpm peers check
```

Do not silence peer warnings with broad overrides. Resolve the owning direct dependency first,
then use an override only when upstream compatibility is known and tested.

## Deprecated `uuid` subdependencies

If pnpm reports old transitive `uuid` releases:

```bash
corepack pnpm -r why uuid
```

The repository does not directly depend on `uuid`. Do not force an unrelated major through
`pnpm.overrides`; update or replace the direct parent package that introduces it. A major
override can break the parent's runtime API contract even when installation succeeds.

## Minimum release age

The workspace uses a 24-hour supply-chain freshness gate:

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeStrict: true
```

Expo SDK 57 / React Native 0.86 packages that were explicitly reviewed during the current
upgrade are recorded in `minimumReleaseAgeExclude`. Keep exclusions exact and versioned;
do not replace them with package-wide wildcards.

## Direct application dependencies

The desktop console directly pins:

```text
axios       1.19.0
bs58        6.0.0
lodash      4.18.1
zod         4.4.3
```

The backend directly pins:

```text
ws          8.21.3
```

Browser WebSockets use the native browser `WebSocket` implementation. `ws` is intentionally
Node/backend-only.

## Lockfile

A production checkout should commit `pnpm-lock.yaml`.

```bash
corepack pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
```

After the lockfile is committed, CI and bootstrap should use `--frozen-lockfile`.
