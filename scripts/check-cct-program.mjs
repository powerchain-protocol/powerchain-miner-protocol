import { readFile } from "node:fs/promises";

const PLACEHOLDER =
  "11111111111111111111111111111111";

const [
  lib,
  anchor,
  cargo,
  constants,
  tsConstants,
] = await Promise.all([
  readFile(
    "programs/cct/src/lib.rs",
    "utf8",
  ),
  readFile("Anchor.toml", "utf8"),
  readFile(
    "programs/cct/Cargo.toml",
    "utf8",
  ),
  readFile(
    "programs/cct/src/constants.rs",
    "utf8",
  ),
  readFile(
    "packages/powerchain-protocol/cct/src/constants.ts",
    "utf8",
  ),
]);

const declared = lib.match(
  /declare_id!\("([1-9A-HJ-NP-Za-km-z]{32,44})"\)/,
)?.[1];

if (!declared) {
  throw new Error(
    "CCT declare_id! is missing or malformed",
  );
}

for (const [rustName, seed] of [
  ["REGISTRY_SEED", "cct-registry"],
  ["MINT_AUTHORITY_SEED", "cct-mint-authority"],
  ["PROJECT_SEED", "cct-project"],
  ["BATCH_SEED", "cct-batch"],
  ["RETIREMENT_SEED", "cct-retirement"],
]) {
  if (
    !new RegExp(
      `pub const ${rustName}: &\\[u8\\] = b"${seed}";`,
    ).test(constants)
  ) {
    throw new Error(
      `CCT Rust constants missing ${rustName}`,
    );
  }
  if (!tsConstants.includes(`"${seed}"`)) {
    throw new Error(
      `CCT TypeScript constants missing ${seed}`,
    );
  }
}

if (
  !/CCT_DECIMALS:\s*u8\s*=\s*6/.test(
    constants,
  ) ||
  !/CCT_DECIMALS\s*=\s*6/.test(
    tsConstants,
  )
) {
  throw new Error(
    "CCT decimals must remain canonical 6",
  );
}

if (!/anchor-lang = "1\.1\.2"/.test(cargo)) {
  throw new Error(
    "CCT must pin anchor-lang 1.1.2",
  );
}
if (
  !/anchor-spl = \{ version = "1\.1\.2"/.test(
    cargo,
  )
) {
  throw new Error(
    "CCT must pin anchor-spl 1.1.2",
  );
}

const sections = Object.fromEntries(
  [
    ...anchor.matchAll(
      /\[programs\.(devnet|mainnet)\][\s\S]*?cct\s*=\s*"([^"]+)"/g,
    ),
  ].map((match) => [
    match[1],
    match[2],
  ]),
);

for (const cluster of [
  "devnet",
  "mainnet",
]) {
  if (!sections[cluster]) {
    throw new Error(
      `Anchor.toml missing CCT ${cluster} program id`,
    );
  }
}

for (const instruction of [
  "initialize_registry",
  "register_project",
  "set_project_active",
  "issue_verified_batch",
  "retire_credits",
  "set_paused",
  "set_verifier",
  "propose_authority",
  "cancel_authority_transfer",
  "accept_authority",
]) {
  if (
    !lib.includes(
      `pub fn ${instruction}`,
    )
  ) {
    throw new Error(
      `CCT program missing ${instruction}`,
    );
  }
}

console.log(JSON.stringify({
  program: "powerchain-cct",
  version: "1.0.0",
  programId: declared,
  configuredProgramIds: sections,
  tokenPrograms: [
    "SPL_TOKEN",
    "TOKEN_2022",
  ],
  decimals: 6,
  deploymentReady:
    declared !== PLACEHOLDER,
  placeholder:
    declared === PLACEHOLDER,
}, null, 2));
