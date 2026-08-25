import { readFile } from "node:fs/promises";

const cluster = process.argv[2] ?? "devnet";
if (!["devnet", "mainnet-beta"].includes(cluster)) {
  console.error(
    "usage: node scripts/verify-deployment-manifest.mjs <devnet|mainnet-beta>",
  );
  process.exit(2);
}

const manifest = JSON.parse(
  await readFile(`target/manifests/${cluster}.json`, "utf8"),
);
const lib = await readFile("programs/miner/src/lib.rs", "utf8");
const anchor = await readFile("Anchor.toml", "utf8");

const sourceId =
  lib.match(/declare_id!\("([^"]+)"\)/)?.[1];
const section =
  cluster === "devnet" ? "devnet" : "mainnet";
const anchorPattern = new RegExp(
  `\\[programs\\.${section}\\][\\s\\S]*?miner\\s*=\\s*"([^"]+)"`,
);
const anchorId = anchor.match(anchorPattern)?.[1];

const errors = [];

if (!manifest.programId) {
  errors.push("deployment manifest programId is missing");
}
if (!sourceId) {
  errors.push("declare_id! is missing");
}
if (!anchorId) {
  errors.push(
    `Anchor.toml [programs.${section}] miner is missing`,
  );
}

if (
  manifest.programId &&
  sourceId &&
  manifest.programId !== sourceId
) {
  errors.push(
    `manifest programId ${manifest.programId} != declare_id ${sourceId}`,
  );
}
if (
  manifest.programId &&
  anchorId &&
  manifest.programId !== anchorId
) {
  errors.push(
    `manifest programId ${manifest.programId} != Anchor.toml ${anchorId}`,
  );
}
if (
  manifest.programId ===
  "11111111111111111111111111111111"
) {
  errors.push(
    "placeholder system-program ID cannot be deployed as Miner program",
  );
}

const requireInitialized =
  process.env.REQUIRE_INITIALIZED_DEPLOYMENT === "1";

if (requireInitialized) {
  for (const field of [
    "minerMint",
    "treasuryVault",
    "verifier",
  ]) {
    if (!manifest[field]) {
      errors.push(
        `initialized deployment manifest ${field} is missing`,
      );
    }
  }
}

if (
  process.env.REQUIRE_BUILD_EVIDENCE === "1"
) {
  for (const field of [
    "idlSha256",
    "programBinarySha256",
  ]) {
    if (!manifest[field]) {
      errors.push(`deployment build evidence ${field} is missing`);
    }
  }
}

if (
  process.env.REQUIRE_VERIFIED_DEPLOYMENT === "1" &&
  manifest.verified !== true
) {
  errors.push(
    "deployment manifest is not marked verified",
  );
}

if (errors.length) {
  console.error(
    errors.map((error) => `- ${error}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      cluster,
      programId: manifest.programId,
      initialized: Boolean(
        manifest.minerMint &&
        manifest.treasuryVault &&
        manifest.verifier,
      ),
      buildEvidence: Boolean(
        manifest.idlSha256 &&
        manifest.programBinarySha256,
      ),
      verified: Boolean(manifest.verified),
    },
    null,
    2,
  ),
);
