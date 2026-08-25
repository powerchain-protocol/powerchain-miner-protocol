import orderBy from "lodash/orderBy";

export type QueryPage<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

export function paginate<T>(
  items: readonly T[],
  input: {
    offset?: number;
    limit?: number;
  } = {},
): QueryPage<T> {
  const offset = Math.max(0, input.offset ?? 0);
  const limit = Math.min(
    100,
    Math.max(1, input.limit ?? 25),
  );

  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    offset,
    limit,
  };
}

export function sortBy<T extends object>(
  items: readonly T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc",
): T[] {
  return orderBy(
    [...items],
    [key as string],
    [direction],
  ) as T[];
}
