import { generateKeyPairSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const privatePath = resolve(process.argv[2] ?? "target/keys/evidence-verifier.pem");
const publicPath = resolve(process.argv[3] ?? "target/keys/evidence-verifier.pub.pem");

const { privateKey, publicKey } = generateKeyPairSync("ed25519");

await mkdir(dirname(privatePath), { recursive: true });
await mkdir(dirname(publicPath), { recursive: true });

await writeFile(
  privatePath,
  privateKey.export({ format: "pem", type: "pkcs8" }),
  { mode: 0o600 },
);
await writeFile(
  publicPath,
  publicKey.export({ format: "pem", type: "spki" }),
  { mode: 0o644 },
);

console.log(`private: ${privatePath}`);
console.log(`public:  ${publicPath}`);
console.log("Register only the public key with the Miner API.");
