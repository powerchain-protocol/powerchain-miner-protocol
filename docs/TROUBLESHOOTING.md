# Troubleshooting

## Bootstrap ends with `DATABASE_NOT_STARTED`

This is a successful partial development bootstrap, not an installation failure. Dependencies and local environment files are ready, but PostgreSQL was not started.

Continue with frontend/mobile/tooling work, or start/configure a database and run:

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

For strict all-in-one setup use:

```bash
pnpm bootstrap:db
```

## `ERR_PNPM_IGNORED_BUILDS`

The workspace uses strict dependency build review. The committed policy intentionally allows
`esbuild` and denies the optional native acceleration scripts from `bigint-buffer`,
`bufferutil`, and `utf-8-validate`.

Verify the repository policy:

```bash
node scripts/check-pnpm-build-policy.mjs
```

Then install:

```bash
pnpm install
```

If a **new** package appears in `ERR_PNPM_IGNORED_BUILDS`, do not blindly approve all builds.
Review the package and add an explicit `true` or `false` entry to `allowBuilds` in
`pnpm-workspace.yaml`.

## Every `pnpm` command seems to run `pnpm install` again

pnpm 11 can verify dependency state before script execution and may automatically install
when stale. This repository explicitly uses:

```yaml
verifyDepsBeforeRun: warn
```

A stale workspace now warns instead of repeatedly reinstalling. Run:

```bash
pnpm install
```

and then retry the intended command.

## `zsh: command not found: docker`

Docker is not installed or not on `PATH`.

Run:

```bash
pnpm doctor
```

For macOS, install/start Docker Desktop and rerun:

```bash
pnpm db:up
```

Alternatively configure a reachable PostgreSQL 17 server in `apps/backend/.env`. Docker is
not required when that database endpoint is already reachable.

## Database migration cannot connect

Check the resolved backend environment and connectivity:

```bash
cat apps/backend/.env
POWERCHAIN_DB_WAIT_ATTEMPTS=1 node scripts/check-database.mjs
```

Backend/database commands automatically load `apps/backend/.env`. Exported environment
variables override values from that file.

## `minerctl health` reports inactive

```bash
systemctl status powerchain-miner
journalctl -u powerchain-miner -n 200 --no-pager
```

## Proof queue grows

Check:
- network connectivity
- API URL
- TLS/certificate validity
- device/client enrollment state
- backend logs
- proof rejection response

## Modbus source fails

Confirm the vendor-specific:
- host/port
- unit/device ID
- register address
- register encoding/count
- scaling
- byte/word order where relevant

Never solve a register-map error by guessing values.

## No rewards

Verify:
- proof is VERIFIED
- active reward policy exists
- open reward epoch covers the timestamp
- daily/per-proof caps are not exhausted
- device is assigned to the correct client/owner
