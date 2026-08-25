import { PublicKey } from "@solana/web3.js";
import {
  createAdminProgram,
  deriveDevicePda,
  deriveMinerPda,
  deriveProtocolPdas,
} from "../src/index.js";
import { readEnvFile, required } from "./env.js";

const env = await readEnvFile(process.argv[2]);
const programId = new PublicKey(
  required(env, "POWERCHAIN_MINER_PROGRAM_ID", "PROGRAM_ID"),
);
const pdas = deriveProtocolPdas(programId);

const output: Record<string, unknown> = {
  programId: programId.toBase58(),
  config: pdas.config.toBase58(),
  treasuryAuthority: pdas.treasuryAuthority.toBase58(),
  treasuryVault: pdas.treasuryVault.toBase58(),
};

if (env.OWNER_WALLET) {
  output.miner = deriveMinerPda(
    programId,
    new PublicKey(env.OWNER_WALLET),
  )[0].toBase58();
}

if (env.DEVICE_SIGNING_PUBKEY) {
  output.device = deriveDevicePda(
    programId,
    new PublicKey(env.DEVICE_SIGNING_PUBKEY),
  )[0].toBase58();
}

if (
  env.POWERCHAIN_SOLANA_RPC_URL &&
  env.ADMIN_KEYPAIR &&
  env.POWERCHAIN_MINER_IDL
) {
  const admin = await createAdminProgram({
    rpcUrl: env.POWERCHAIN_SOLANA_RPC_URL,
    keypairPath: env.ADMIN_KEYPAIR,
    idlPath: env.POWERCHAIN_MINER_IDL,
    programId: programId.toBase58(),
  });

  try {
    output.protocol = await (admin.program.account as any)
      .protocolConfig
      .fetch(pdas.config);
  } catch (error) {
    output.protocolFetchError = (error as Error).message;
  }
}

console.log(
  JSON.stringify(
    output,
    (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    2,
  ),
);
