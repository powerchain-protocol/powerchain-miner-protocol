import {
  createAdminProgram,
  updateMiningRules,
} from "../src/index.js";
import {
  numberValue,
  readEnvFile,
  required,
} from "./env.js";

const env = await readEnvFile(process.argv[2]);

const rpcUrl = required(
  env,
  "POWERCHAIN_SOLANA_RPC_URL",
  "SOLANA_RPC_URL",
);
const programId = required(
  env,
  "POWERCHAIN_MINER_PROGRAM_ID",
  "PROGRAM_ID",
);
const keypairPath = required(env, "ADMIN_KEYPAIR");
const idlPath =
  env.POWERCHAIN_MINER_IDL ??
  "target/idl/powerchain_miner.json";

const admin = await createAdminProgram({
  rpcUrl,
  keypairPath,
  idlPath,
  programId,
});

const result = await updateMiningRules(
  admin.program as any,
  {
    programId: admin.programId,
    authority: admin.authority.publicKey,
    maxProofAgeSecs: numberValue(
      env,
      "MAX_PROOF_AGE_SECS",
    ),
    maxObservationAgeSecs: numberValue(
      env,
      "MAX_OBSERVATION_AGE_SECS",
    ),
    maxClockSkewSecs: numberValue(
      env,
      "MAX_CLOCK_SKEW_SECS",
    ),
    epochSeconds: numberValue(
      env,
      "EPOCH_SECONDS",
    ),
  },
);

console.log(
  JSON.stringify(
    {
      signature: result.signature,
      config: result.config.toBase58(),
      programId,
    },
    null,
    2,
  ),
);
