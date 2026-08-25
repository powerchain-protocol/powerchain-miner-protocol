import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workspace = await readFile(
  "pnpm-workspace.yaml",
  "utf8",
);
const bootstrap = await readFile(
  "scripts/bootstrap-dev.sh",
  "utf8",
);
const dbUp = await readFile(
  "scripts/db-up.sh",
  "utf8",
);
const backendDb = await readFile(
  "apps/backend/src/db.ts",
  "utf8",
);
const computeUpstream = await readFile(
  "apps/compute/src/upstream.ts",
  "utf8",
);

test("pnpm build scripts are reviewed explicitly", () => {
  assert.match(workspace, /strictDepBuilds:\s*true/);
  assert.match(workspace, /["\']?esbuild@0\.28\.2["\']?:\s*true/);
  assert.match(workspace, /bigint-buffer:\s*false/);
  assert.match(workspace, /bufferutil:\s*false/);
  assert.match(workspace, /utf-8-validate:\s*false/);
});

test("pnpm run no longer auto-installs stale dependencies", () => {
  assert.match(
    workspace,
    /verifyDepsBeforeRun:\s*warn/,
  );
  assert.doesNotMatch(
    workspace,
    /verifyDepsBeforeRun:\s*install/,
  );
});

test("bootstrap installs once and handles lockfile deterministically", () => {
  assert.match(
    bootstrap,
    /pnpm install --frozen-lockfile/,
  );
  assert.match(
    bootstrap,
    /pnpm install --no-frozen-lockfile/,
  );
  assert.match(
    bootstrap,
    /node scripts\/check-pnpm-build-policy\.mjs/,
  );
  assert.match(
    bootstrap,
    /\.\/scripts\/db-up\.sh/,
  );
});

test("database bootstrap fails explicitly when Docker and PostgreSQL are unavailable", () => {
  assert.match(
    dbUp,
    /if ! command -v docker/,
  );
  assert.match(
    dbUp,
    /PostgreSQL is not reachable/,
  );
  assert.match(
    dbUp,
    /Start Docker Desktop/,
  );
});

test("backend and compute services load their app-local env files", () => {
  assert.match(
    backendDb,
    /import "\.\/load-env\.js";/,
  );
  assert.match(
    computeUpstream,
    /import "\.\/load-env\.js";/,
  );
});
