import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function pkg(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("canonical pnpm is 11.23.0", async () => {
  const root = await pkg("package.json");
  assert.equal(root.version, "1.0.0");
  assert.equal(root.packageManager, "pnpm@11.23.0");
});

test("latest compatible web/backend dependency baseline is pinned", async () => {
  const backend = await pkg("apps/backend/package.json");
  const consoleApp = await pkg("apps/console/package.json");
  const frontend = await pkg("apps/frontend/package.json");

  assert.equal(backend.dependencies.fastify, "5.12.1");
  assert.equal(backend.dependencies.zod, "4.4.3");
  assert.equal(backend.dependencies.pg, "8.23.0");
  assert.equal(backend.dependencies["@fastify/cors"], "11.3.0");
  assert.equal(backend.dependencies["@fastify/jwt"], "10.2.2");
  assert.equal(backend.dependencies["@fastify/rate-limit"], "11.2.0");

  for (const app of [consoleApp, frontend]) {
    assert.equal(app.dependencies.next, "16.3.2");
    assert.equal(app.dependencies.react, "19.2.8");
    assert.equal(app.dependencies["react-dom"], "19.2.8");
  }
});

test("Expo stays on its compatible React Native line", async () => {
  const mobile = await pkg("apps/mobile/package.json");
  assert.equal(mobile.dependencies.expo, "57.0.16");
  assert.equal(mobile.dependencies.react, "19.2.3");
  assert.equal(mobile.dependencies["react-native"], "0.86.3");
});

test("Docker stack pins canonical Node, pnpm and PostgreSQL images", async () => {
  const dockerfile = await readFile("docker/Dockerfile", "utf8");
  const compose = await readFile("docker-compose.yml", "utf8");

  assert.match(dockerfile, /node:24\.19\.0-bookworm-slim/);
  assert.match(dockerfile, /PNPM_VERSION=11\.23\.0/);
  assert.match(compose, /postgres:17\.11-alpine3\.24/);
  assert.match(compose, /no-new-privileges:true/);
  assert.match(compose, /cap_drop:/);
  assert.match(compose, /profiles: \["compute"\]/);
});

test("CORS 11 REST methods are explicit", async () => {
  const server = await readFile("apps/backend/src/server.ts", "utf8");
  for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    assert.ok(server.includes(`"${method}"`), method);
  }
});
