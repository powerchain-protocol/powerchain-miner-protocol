import { readFile } from "node:fs/promises";

const PLACEHOLDER = "11111111111111111111111111111111";
const lib = await readFile("programs/miner/src/lib.rs", "utf8");
const anchor = await readFile("Anchor.toml", "utf8");
const cargo = await readFile("programs/miner/Cargo.toml", "utf8");
const rustConstants = await readFile(
  "programs/miner/src/constants.rs",
  "utf8",
);
const tsConstants = await readFile(
  "packages/powerchain-protocol/miner/src/constants.ts",
  "utf8",
);

const declared = lib.match(
  /declare_id!\("([1-9A-HJ-NP-Za-km-z]{32,44})"\)/,
)?.[1];
if (!declared) {
  throw new Error("Miner declare_id! is missing or malformed");
}

const seedPairs = [
  ["PROTOCOL_SEED", "protocol"],
  ["TREASURY_AUTHORITY_SEED", "treasury-authority"],
  ["TREASURY_VAULT_SEED", "treasury-vault"],
  ["MINER_SEED", "miner"],
  ["DEVICE_SEED", "device"],
  ["CLAIM_RECEIPT_SEED", "claim-receipt"],
];

for (const [constant, seed] of seedPairs) {
  const rustPattern = new RegExp(
    `pub const ${constant}: &\\[u8\\] = b"${seed}";`,
  );
  if (!rustPattern.test(rustConstants)) {
    throw new Error(`Rust constants missing ${constant}=${seed}`);
  }
  if (!tsConstants.includes(`"${seed}"`)) {
    throw new Error(`TypeScript protocol constants missing seed ${seed}`);
  }
}

const rustState = rustConstants.match(
  /STATE_VERSION_V1:\s*u16\s*=\s*(\d+)/,
)?.[1];
const tsState = tsConstants.match(
  /STATE_VERSION_V1\s*=\s*(\d+)/,
)?.[1];
if (!rustState || rustState !== tsState || rustState !== "1") {
  throw new Error(
    `state version mismatch: rust=${rustState} typescript=${tsState}`,
  );
}

if (!/anchor-lang = "1\.1\.2"/.test(cargo)) {
  throw new Error("Miner Cargo.toml must pin anchor-lang 1.1.2");
}
if (!/anchor-spl = \{ version = "1\.1\.2"/.test(cargo)) {
  throw new Error("Miner Cargo.toml must pin anchor-spl 1.1.2");
}

const sections = Object.fromEntries(
  [...anchor.matchAll(
    /\[programs\.(devnet|mainnet)\]\s*\nminer\s*=\s*"([^"]+)"/gm,
  )].map((match) => [match[1], match[2]]),
);

for (const cluster of ["devnet", "mainnet"]) {
  if (!sections[cluster]) {
    throw new Error(`Anchor.toml is missing [programs.${cluster}] miner`);
  }
}

const deploymentReady = declared !== PLACEHOLDER;
if (deploymentReady && !Object.values(sections).includes(declared)) {
  throw new Error(
    "declare_id! does not match the configured Devnet or Mainnet miner program id",
  );
}

console.log(JSON.stringify({
  program: "powerchain-miner",
  version: "1.0.0",
  stateVersion: Number(rustState),
  anchor: "1.1.2",
  programId: declared,
  configuredProgramIds: sections,
  deploymentReady,
  placeholder: !deploymentReady,
}, null, 2));
