import { readFile } from "node:fs/promises";

const path = process.argv[2];
if (!path) {
  console.error("usage: node utils/validate-config.mjs <env-file>");
  process.exit(2);
}

const text = await readFile(path, "utf8");
const env = Object.fromEntries(
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("#") &&
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

const required = [
  "SOLANA_CLUSTER",
  "SOLANA_RPC_URL",
  "TOKEN_PROGRAM_ID",
  "PROGRAM_KEYPAIR",
  "MINER_EMISSION_CAP_BASE_UNITS",
  "REWARD_PER_WORK_UNIT_BASE_UNITS",
  "MAX_REWARD_PER_PROOF_BASE_UNITS",
  "MAX_ENERGY_WH_PER_PROOF",
  "MIN_QUALITY_BPS",
  "MAX_PROOF_AGE_SECS",
  "MAX_OBSERVATION_AGE_SECS",
  "MAX_CLOCK_SKEW_SECS",
  "EPOCH_SECONDS",
  "VERIFIER_PUBKEY",
];

const missing = required.filter((key) => !env[key]);
const errors = [];

if (missing.length) {
  errors.push(`missing: ${missing.join(", ")}`);
}

if (!["devnet", "mainnet-beta"].includes(env.SOLANA_CLUSTER)) {
  errors.push("SOLANA_CLUSTER must be devnet or mainnet-beta");
}

if (
  env.TOKEN_PROGRAM_ID &&
  env.TOKEN_PROGRAM_ID !==
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
) {
  errors.push("TOKEN_PROGRAM_ID must be the Solana Token-2022 program");
}

for (const key of [
  "MINER_EMISSION_CAP_BASE_UNITS",
  "REWARD_PER_WORK_UNIT_BASE_UNITS",
  "MAX_REWARD_PER_PROOF_BASE_UNITS",
  "MAX_ENERGY_WH_PER_PROOF",
  "MIN_QUALITY_BPS",
  "MAX_PROOF_AGE_SECS",
  "MAX_OBSERVATION_AGE_SECS",
  "MAX_CLOCK_SKEW_SECS",
  "EPOCH_SECONDS",
]) {
  if (env[key] && !/^[0-9]+$/.test(env[key])) {
    errors.push(`${key} must be an unsigned integer`);
  }
}

if (
  env.MIN_QUALITY_BPS &&
  (
    Number(env.MIN_QUALITY_BPS) < 1 ||
    Number(env.MIN_QUALITY_BPS) > 10_000
  )
) {
  errors.push("MIN_QUALITY_BPS must be 1..10000");
}

if (
  env.MAX_OBSERVATION_AGE_SECS &&
  env.MAX_PROOF_AGE_SECS &&
  BigInt(env.MAX_OBSERVATION_AGE_SECS) <
    BigInt(env.MAX_PROOF_AGE_SECS)
) {
  errors.push(
    "MAX_OBSERVATION_AGE_SECS must be >= MAX_PROOF_AGE_SECS",
  );
}

if (env.SOLANA_CLUSTER === "mainnet-beta") {
  if (env.CONFIRM_MAINNET_BETA !== "YES_I_UNDERSTAND") {
    errors.push(
      "CONFIRM_MAINNET_BETA=YES_I_UNDERSTAND is required",
    );
  }
  if (
    !env.SOLANA_RPC_URL ||
    env.SOLANA_RPC_URL.includes("api.mainnet.solana.com")
  ) {
    errors.push(
      "mainnet-beta requires a dedicated/private RPC",
    );
  }
  for (const key of [
    "MINER_TOKEN_NAME",
    "MINER_TOKEN_SYMBOL",
    "MINER_TOKEN_DECIMALS",
    "MINER_METADATA_URI",
    "MINER_GENESIS_SUPPLY",
  ]) {
    if (!env[key]) errors.push(`mainnet missing: ${key}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      cluster: env.SOLANA_CLUSTER,
      tokenProgram: env.TOKEN_PROGRAM_ID,
    },
    null,
    2,
  ),
);
