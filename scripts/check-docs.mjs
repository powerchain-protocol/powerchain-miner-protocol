import {
  access,
  readFile,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();

const documents = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CONTRIBUTORS.md",
  "programs/README.md",
  "programs/miner/README.md",
  "packages/powerchain-protocol/miner/README.md",
  "packages/miner-sdk/README.md",
  "apps/backend/README.md",
  "apps/compute/README.md",
  "apps/frontend/README.md",
  "apps/mobile/README.md",
  "apps/console/ARCHITECTURE.md",
  "docker/README.md",
  "docs/README.md",
  "docs/PROJECT-STRUCTURE.md",
  "docs/history/README.md",
  "skills/PAY.SH.md",
  "skills/REWARDS.md",
  "skills/MINER.md",
  "docs/NPM-PUBLISHING.md",
  "docs/KEY-MANAGEMENT.md",
  "docs/MINING-ENGINE.md",
];

const markdownLink = /\[[^\]]+\]\(([^)]+)\)/g;
const errors = [];

for (const file of documents) {
  let source;
  try {
    source = await readFile(resolve(root, file), "utf8");
  } catch {
    errors.push(`${file}: missing`);
    continue;
  }

  if (
    file === "README.md" &&
    !/\*\*Canonical version:\*\* `1\.0\.0`/.test(source)
  ) {
    errors.push("README.md: canonical version must be 1.0.0");
  }

  for (const match of source.matchAll(markdownLink)) {
    const target = match[1];
    if (
      target.startsWith("#") ||
      /^[a-z]+:\/\//i.test(target) ||
      target.startsWith("mailto:")
    ) {
      continue;
    }

    const pathname = target.split("#", 1)[0];
    if (!pathname) continue;

    try {
      await access(
        resolve(root, dirname(file), pathname),
      );
    } catch {
      errors.push(`${file}: broken link ${target}`);
    }
  }
}

const program = await readFile(
  resolve(root, "programs/miner/src/lib.rs"),
  "utf8",
);
const programReadme = await readFile(
  resolve(root, "programs/miner/README.md"),
  "utf8",
);

const instructions = [
  "initialize_protocol",
  "register_miner",
  "register_device",
  "reassign_device",
  "submit_verified_proof",
  "claim_rewards",
  "set_device_enabled",
  "set_paused",
  "set_verifier",
  "update_reward_policy",
  "update_mining_rules",
  "propose_authority",
  "cancel_authority_transfer",
  "accept_authority",
];

for (const instruction of instructions) {
  if (!program.includes(`pub fn ${instruction}`)) {
    errors.push(
      `programs/miner/src/lib.rs: missing expected ${instruction}`,
    );
  }
  if (!programReadme.includes(`\`${instruction}\``)) {
    errors.push(
      `programs/miner/README.md: undocumented ${instruction}`,
    );
  }
}

for (const required of [
  "CHANGELOG.md",
  "CONTRIBUTORS.md",
  "CONTRIBUTING.md",
]) {
  try {
    await access(resolve(root, required));
  } catch {
    errors.push(`${required}: required root governance document missing`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Documentation: ${documents.length} canonical documents and ${instructions.length} Miner instructions verified`,
);
