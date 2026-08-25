import test from "node:test";
import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";

test("canonical Solana token and Metaplex program ids are centralized", async () => {
  const source = await readFile(
    "packages/powerchain-protocol/miner/src/solana/program-ids.ts",
    "utf8",
  );

  for (const id of [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
    "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
  ]) {
    assert.match(source, new RegExp(id));
  }
});

test("Solana DePIN integration does not invent @solana/depin dependency", async () => {
  const depin = await readFile(
    "packages/powerchain-protocol/miner/src/depin/solana.ts",
    "utf8",
  );
  const workspacePackages = await Promise.all([
    readFile("package.json", "utf8"),
    readFile(
      "packages/powerchain-protocol/miner/package.json",
      "utf8",
    ),
  ]);

  assert.match(
    depin,
    /NO_OFFICIAL_@solana\/depin_PACKAGE/,
  );
  for (const source of workspacePackages) {
    const parsed = JSON.parse(source);
    assert.equal(
      parsed.dependencies?.["@solana/depin"],
      undefined,
    );
    assert.equal(
      parsed.devDependencies?.["@solana/depin"],
      undefined,
    );
  }
});

test("Helium program registry and BFF routes are wired", async () => {
  const helium = await readFile(
    "packages/powerchain-protocol/miner/src/helium/index.ts",
    "utf8",
  );
  const routes = await readFile(
    "apps/backend/src/api/v1/helium.ts",
    "utf8",
  );
  const server = await readFile(
    "apps/backend/src/server.ts",
    "utf8",
  );

  for (const id of [
    "circAbx64bbsscPbQzZAUvuXpHqrCe6fLMzc2uKXz9g",
    "credMBJhYFzfn7NxBMdU4aUqFggAjgztaCcv2Fo6fPT",
    "hemjuPXBpNvggtaUnN1MwT3wrdhttKEfosTcc2P9Pg8",
    "hdaoVTCqhfHHo75XdAMxBKdUqvq1i5bF23sisBqVgGR",
    "1azyuavdMyvsivtNxPoz6SucD18eDHeXzFCUPq5XU7w",
  ]) {
    assert.match(
      helium,
      new RegExp(id),
    );
  }

  assert.match(
    routes,
    /integrations\/helium\/gateways/,
  );
  assert.match(
    routes,
    /integrations\/helium\/entity\/wallet/,
  );
  assert.match(
    server,
    /registerHeliumRoutes\(app\)/,
  );
});

test("CCT package and program preserve verified issuance and burn retirement", async () => {
  const cct = await readFile(
    "programs/cct/src/lib.rs",
    "utf8",
  );
  const constants = await readFile(
    "packages/powerchain-protocol/cct/src/constants.ts",
    "utf8",
  );
  const cargo = await readFile(
    "Cargo.toml",
    "utf8",
  );

  assert.match(
    constants,
    /CCT_DECIMALS = 6/,
  );
  assert.match(
    constants,
    /1_000_000n/,
  );
  assert.match(
    cct,
    /token_interface::mint_to/,
  );
  assert.match(
    cct,
    /token_interface::burn/,
  );
  assert.match(
    cct,
    /issue_verified_batch/,
  );
  assert.match(
    cct,
    /retire_credits/,
  );
  assert.match(
    cargo,
    /programs\/cct/,
  );
});

test("Community DePIN marketing preserves evidence-before-settlement boundary", async () => {
  const component = await readFile(
    "apps/frontend/components/sections/CommunityDepinSection.tsx",
    "utf8",
  );
  const page = await readFile(
    "apps/frontend/app/page.tsx",
    "utf8",
  );

  for (const title of [
    "Solana Wallet Integration",
    "Solar Panel Monitoring",
    "IoT Device Integration",
    "Energy Analytics",
    "Energy Marketplace",
    "Peer-to-Peer Trading",
  ]) {
    assert.match(
      component,
      new RegExp(title),
    );
  }

  assert.match(
    component,
    /Meter Evidence/,
  );
  assert.match(
    page,
    /<CommunityDepinSection \/>/,
  );
});

test("Helium RPM builder requires explicit local binary and version", async () => {
  const source = await readFile(
    "linux/rpm/helium/build-rpm.sh",
    "utf8",
  );

  assert.match(
    source,
    /HELIUM_BINARY/,
  );
  assert.match(
    source,
    /HELIUM_VERSION/,
  );
  assert.doesNotMatch(
    source,
    /curl\s+.*latest|wget\s+.*latest/i,
  );
});
