# PowerChain v1.3.1 — Development Reliability Fixes

v1.3.1 fixes the local installation/startup failures reported with pnpm 11.22.0 and a
machine without Docker installed.

## pnpm lifecycle scripts

The workspace now commits an explicit pnpm 11 build policy:

```yaml
strictDepBuilds: true

allowBuilds:
  "esbuild@0.28.2": true
  bigint-buffer: false
  bufferutil: false
  utf-8-validate: false
```

`esbuild` is approved for the TypeScript/Next/Expo toolchain.

The other reported native builds are optional acceleration paths and remain explicitly
denied instead of being granted install-script execution.

New unreviewed dependency build scripts continue to fail installation because
`strictDepBuilds` remains enabled.

## Repeated install loop

pnpm 11 may verify dependency state before every `pnpm run` and can auto-run an install.

The workspace now uses:

```yaml
verifyDepsBeforeRun: warn
```

so stale dependency state is reported without repeatedly launching a full workspace install.

## Docker/PostgreSQL

The previous bootstrap silently skipped `docker compose` when `docker` did not exist and then
ran database migrations anyway.

The new database bootstrap:

```text
existing PostgreSQL reachable?
  yes → use it
  no
   ↓
Docker installed and daemon running?
  yes → docker compose up + wait
  no  → fail with actionable instructions
```

An external PostgreSQL 17 server is supported through `apps/backend/.env`.

## Environment loading

Backend commands now automatically load:

```text
apps/backend/.env
```

and Agent Compute automatically loads:

```text
apps/compute/.env
```

Exported process environment values retain precedence.

## Developer commands

```bash
pnpm doctor
pnpm bootstrap
pnpm db:up
pnpm db:down
pnpm deps:build-policy
pnpm deps:review
pnpm peers:check
pnpm dev:apps
```

## Lockfile behavior

If `pnpm-lock.yaml` is present, bootstrap uses `--frozen-lockfile`.

If it is missing, bootstrap performs one `--no-frozen-lockfile` install and explicitly asks
the developer to commit the generated lockfile.
