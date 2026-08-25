import { fetchBirdeyePrice } from "@/lib/market-data/birdeye";
import {
  fetchPythPrices,
  type PythPrice,
} from "@/lib/market-data/pyth";

export type PriceRequest =
  | {
      source: "birdeye";
      address: string;
      chain?: string;
    }
  | {
      source: "pyth";
      feedIds: readonly string[];
    };

export async function fetchPrices(
  request: PriceRequest,
): Promise<number | PythPrice[]> {
  return request.source === "birdeye"
    ? fetchBirdeyePrice(request)
    : fetchPythPrices(request.feedIds);
}
