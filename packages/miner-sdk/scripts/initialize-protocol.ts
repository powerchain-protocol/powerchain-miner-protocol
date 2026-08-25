import { PublicKey } from "@solana/web3.js";
import {
  createAdminProgram,
  initializeProtocol,
} from "../src/index.js";
import {
  bigintValue,
  numberValue,
  readEnvFile,
  required,
} from "./env.js";

const env = await readEnvFile(process.argv[2]);

const rpcUrl = required(env, "POWERCHAIN_SOLANA_RPC_URL", "SOLANA_RPC_URL");
const programId = required(env, "POWERCHAIN_MINER_PROGRAM_ID", "PROGRAM_ID");
const minerMint = required(env, "POWERCHAIN_MINER_MINT", "MINER_MINT");
const verifier = required(env, "VERIFIER_PUBKEY");
const keypairPath = required(env, "ADMIN_KEYPAIR");
const idlPath = env.POWERCHAIN_MINER_IDL ?? "target/idl/powerchain_miner.json";

const admin = await createAdminProgram({
  rpcUrl,
  keypairPath,
  idlPath,
  programId,
});

const result = await initializeProtocol(admin.program as any, {
  programId: admin.programId,
  authority: admin.authority.publicKey,
  minerMint: new PublicKey(minerMint),
  verifier: new PublicKey(verifier),
  rewardPerWorkUnit: bigintValue(
    env,
    "REWARD_PER_WORK_UNIT_BASE_UNITS",
  ),
  maxRewardPerProof: bigintValue(
    env,
    "MAX_REWARD_PER_PROOF_BASE_UNITS",
  ),
  maxEnergyWhPerProof: bigintValue(
    env,
    "MAX_ENERGY_WH_PER_PROOF",
  ),
  minQualityBps: numberValue(env, "MIN_QUALITY_BPS"),
  emissionCap: bigintValue(
    env,
    "MINER_EMISSION_CAP_BASE_UNITS",
  ),
  maxProofAgeSecs: numberValue(env, "MAX_PROOF_AGE_SECS"),
  maxObservationAgeSecs: numberValue(
    env,
    "MAX_OBSERVATION_AGE_SECS",
  ),
  maxClockSkewSecs: numberValue(env, "MAX_CLOCK_SKEW_SECS"),
  epochSeconds: numberValue(env, "EPOCH_SECONDS"),
});

console.log(
  JSON.stringify(
    {
      signature: result.signature,
      programId,
      authority: admin.authority.publicKey.toBase58(),
      minerMint,
      verifier,
      config: result.config.toBase58(),
      treasuryAuthority: result.treasuryAuthority.toBase58(),
      treasuryVault: result.treasuryVault.toBase58(),
    },
    null,
    2,
  ),
);
