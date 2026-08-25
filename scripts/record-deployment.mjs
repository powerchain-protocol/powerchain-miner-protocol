import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";

const cluster = process.argv[2];
const envPath = process.argv[3];

if (!["devnet", "mainnet-beta"].includes(cluster) || !envPath) {
  console.error(
    "usage: node scripts/record-deployment.mjs <devnet|mainnet-beta> <env-file>",
  );
  process.exit(2);
}

const envText = await readFile(envPath, "utf8");
const fileEnv = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter(
      (line) =>
        line &&
        !line.trimStart().startsWith("#") &&
        line.includes("="),
    )
    .map((line) => {
      const index = line.indexOf("=");
      return [
        line.slice(0, index).trim(),
        line.slice(index + 1).trim(),
      ];
    }),
);

const processEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry) => typeof entry[1] === "string",
  ),
);
const env = { ...fileEnv, ...processEnv };

const path = `target/manifests/${cluster}.json`;
const current = JSON.parse(await readFile(path, "utf8"));

async function sha256IfPresent(file) {
  try {
    await stat(file);
    return createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
  } catch {
    return null;
  }
}

function gitCommit() {
  try {
    return execFileSync(
      "git",
      ["rev-parse", "HEAD"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
  } catch {
    return null;
  }
}

const nextProgramId =
  env.POWERCHAIN_MINER_PROGRAM_ID ||
  env.PROGRAM_ID ||
  current.programId;

const idlPath =
  env.POWERCHAIN_MINER_IDL ||
  "target/idl/powerchain_miner.json";
const binaryPath =
  env.POWERCHAIN_MINER_BINARY ||
  "target/deploy/powerchain_miner.so";

const verified = env.DEPLOYMENT_VERIFIED === "true";

const next = {
  ...current,
  manifestVersion: 1,
  cluster,
  programId: nextProgramId,
  minerMint:
    env.POWERCHAIN_MINER_MINT ||
    env.MINER_MINT ||
    current.minerMint,
  treasuryVault:
    env.POWERCHAIN_MINER_TREASURY_VAULT ||
    env.POWERCHAIN_TREASURY_VAULT ||
    current.treasuryVault,
  verifier:
    env.VERIFIER_PUBKEY ||
    current.verifier,
  sourceCommit:
    env.SOURCE_COMMIT ||
    gitCommit() ||
    current.sourceCommit ||
    null,
  idlSha256:
    (await sha256IfPresent(idlPath)) ||
    current.idlSha256 ||
    null,
  programBinarySha256:
    (await sha256IfPresent(binaryPath)) ||
    current.programBinarySha256 ||
    null,
  deployedAt: new Date().toISOString(),
  verified,
  verifiedAt:
    verified
      ? new Date().toISOString()
      : null,
};

await writeFile(
  path,
  `${JSON.stringify(next, null, 2)}\n`,
);

console.log(path);
