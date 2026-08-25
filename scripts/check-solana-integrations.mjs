import {
  readFile,
} from "node:fs/promises";

const programIds = await readFile(
  "packages/powerchain-protocol/miner/src/solana/program-ids.ts",
  "utf8",
);
const helium = await readFile(
  "packages/powerchain-protocol/miner/src/helium/index.ts",
  "utf8",
);
const depin = await readFile(
  "packages/powerchain-protocol/miner/src/depin/solana.ts",
  "utf8",
);

for (const [label, address] of [
  [
    "SPL Token",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  ],
  [
    "Token-2022",
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  ],
  [
    "Associated Token",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  ],
  [
    "Metaplex Token Metadata",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  ],
  [
    "Metaplex Core",
    "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
  ],
  [
    "Bubblegum",
    "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
  ],
]) {
  if (!programIds.includes(address)) {
    throw new Error(
      `missing canonical ${label} program id`,
    );
  }
}

for (const address of [
  "circAbx64bbsscPbQzZAUvuXpHqrCe6fLMzc2uKXz9g",
  "credMBJhYFzfn7NxBMdU4aUqFggAjgztaCcv2Fo6fPT",
  "hemjuPXBpNvggtaUnN1MwT3wrdhttKEfosTcc2P9Pg8",
  "hdaoVTCqhfHHo75XdAMxBKdUqvq1i5bF23sisBqVgGR",
  "1azyuavdMyvsivtNxPoz6SucD18eDHeXzFCUPq5XU7w",
]) {
  if (!helium.includes(address)) {
    throw new Error(
      `missing Helium program id ${address}`,
    );
  }
}

if (
  !depin.includes(
    "NO_OFFICIAL_@solana/depin_PACKAGE",
  )
) {
  throw new Error(
    "Solana DePIN adapter must not fabricate @solana/depin npm dependency",
  );
}

console.log(
  "Solana integrations: SPL, Token-2022, Metaplex, Helium and DePIN registry verified",
);
