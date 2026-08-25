import { z } from "zod";
import { serverEnv } from "@/env/server";

const priceEnvelope = z.object({
  success: z.boolean(),
  data: z.object({
    value: z.number(),
  }),
});

export async function fetchBirdeyePrice(input: {
  address: string;
  chain?: string;
}): Promise<number> {
  if (!serverEnv.birdeyeApiKey) {
    throw new Error(
      "BIRDEYE_API_KEY is not configured.",
    );
  }

  const url = new URL(
    "/defi/price",
    serverEnv.birdeyeApiUrl,
  );
  url.searchParams.set("address", input.address);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-API-KEY": serverEnv.birdeyeApiKey,
      "x-chain": input.chain ?? "solana",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Birdeye HTTP ${response.status}`,
    );
  }

  return priceEnvelope.parse(
    await response.json(),
  ).data.value;
}
