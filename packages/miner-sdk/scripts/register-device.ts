import { PublicKey } from "@solana/web3.js";
import {
  createAdminProgram,
  loadKeypair,
  registerDevice,
} from "../src/index.js";
import { readEnvFile, required } from "./env.js";

const env = await readEnvFile(process.argv[2]);
const admin = await createAdminProgram({
  rpcUrl: required(env, "POWERCHAIN_SOLANA_RPC_URL", "SOLANA_RPC_URL"),
  keypairPath: required(env, "ADMIN_KEYPAIR"),
  idlPath: env.POWERCHAIN_MINER_IDL ?? "target/idl/powerchain_miner.json",
  programId: required(env, "POWERCHAIN_MINER_PROGRAM_ID", "PROGRAM_ID"),
});

const owner = await loadKeypair(required(env, "OWNER_KEYPAIR"));
const deviceSigningKey = new PublicKey(
  required(env, "DEVICE_SIGNING_PUBKEY"),
);

const result = await registerDevice(admin.program as any, {
  programId: admin.programId,
  authority: admin.authority.publicKey,
  owner,
  deviceSigningKey,
});

console.log(
  JSON.stringify(
    {
      signature: result.signature,
      owner: owner.publicKey.toBase58(),
      deviceSigningKey: deviceSigningKey.toBase58(),
      miner: result.miner.toBase58(),
      device: result.device.toBase58(),
    },
    null,
    2,
  ),
);
