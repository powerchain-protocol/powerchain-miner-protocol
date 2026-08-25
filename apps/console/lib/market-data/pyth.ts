import { z } from "zod";
import { serverEnv } from "@/env/server";

const priceValue = z.object({
  price: z.string(),
  conf: z.string(),
  expo: z.number().int(),
  publish_time: z.number().int(),
});

const latestPrice = z.object({
  parsed: z.array(
    z.object({
      id: z.string(),
      price: priceValue,
    }),
  ),
});

export type PythPrice = {
  id: string;
  price: string;
  confidence: string;
  exponent: number;
  publishTime: number;
};

export async function fetchPythPrices(
  feedIds: readonly string[],
): Promise<PythPrice[]> {
  if (!feedIds.length) return [];

  const url = new URL(
    "v2/updates/price/latest",
    `${serverEnv.pythHermesUrl.replace(/\/+$/, "")}/`,
  );

  for (const id of feedIds) {
    url.searchParams.append("ids[]", id);
  }
  url.searchParams.set("parsed", "true");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (serverEnv.pythApiKey) {
    headers.Authorization =
      `Bearer ${serverEnv.pythApiKey}`;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Pyth Hermes HTTP ${response.status}`,
    );
  }

  const parsed = latestPrice.parse(
    await response.json(),
  );

  return parsed.parsed.map((item) => ({
    id: item.id,
    price: item.price.price,
    confidence: item.price.conf,
    exponent: item.price.expo,
    publishTime: item.price.publish_time,
  }));
}
