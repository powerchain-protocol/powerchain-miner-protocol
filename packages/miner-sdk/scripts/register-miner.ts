import {
  createAdminProgram,
  registerMiner,
} from "../src/index.js";
import { readEnvFile, required } from "./env.js";

const env = await readEnvFile(process.argv[2]);
const admin = await createAdminProgram({
  rpcUrl: required(env, "POWERCHAIN_SOLANA_RPC_URL", "SOLANA_RPC_URL"),
  keypairPath: required(env, "OWNER_KEYPAIR", "ADMIN_KEYPAIR"),
  idlPath: env.POWERCHAIN_MINER_IDL ?? "target/idl/powerchain_miner.json",
  programId: required(env, "POWERCHAIN_MINER_PROGRAM_ID", "PROGRAM_ID"),
});

const result = await registerMiner(admin.program as any, {
  programId: admin.programId,
  owner: admin.authority.publicKey,
});

console.log(
  JSON.stringify(
    {
      signature: result.signature,
      owner: admin.authority.publicKey.toBase58(),
      miner: result.miner.toBase58(),
    },
    null,
    2,
  ),
);
