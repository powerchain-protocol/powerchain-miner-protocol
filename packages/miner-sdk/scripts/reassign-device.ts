import { PublicKey } from "@solana/web3.js";
import {
  createAdminProgram,
  loadKeypair,
  reassignDevice,
} from "../src/index.js";
import { readEnvFile, required } from "./env.js";

const env = await readEnvFile(process.argv[2]);
const admin = await createAdminProgram({
  rpcUrl: required(env, "POWERCHAIN_SOLANA_RPC_URL", "SOLANA_RPC_URL"),
  keypairPath: required(env, "ADMIN_KEYPAIR"),
  idlPath: env.POWERCHAIN_MINER_IDL ?? "target/idl/powerchain_miner.json",
  programId: required(env, "POWERCHAIN_MINER_PROGRAM_ID", "PROGRAM_ID"),
});

const newOwner = await loadKeypair(
  required(env, "NEW_OWNER_KEYPAIR", "OWNER_KEYPAIR"),
);
const deviceSigningKey = new PublicKey(
  required(env, "DEVICE_SIGNING_PUBKEY"),
);

const result = await reassignDevice(admin.program as any, {
  programId: admin.programId,
  authority: admin.authority.publicKey,
  newOwner,
  deviceSigningKey,
});

console.log(
  JSON.stringify(
    {
      signature: result.signature,
      device: result.device.toBase58(),
      newOwner: result.newOwner.toBase58(),
      newMiner: result.newMiner.toBase58(),
    },
    null,
    2,
  ),
);
