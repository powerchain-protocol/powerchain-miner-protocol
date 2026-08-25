export type ChartPoint = {
  x: number;
  y: number;
  label?: string;
};

export function normalizeSeries(
  values: readonly number[],
): number[] {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
}

export function sparklinePoints(
  values: readonly number[],
  width = 100,
  height = 32,
): ChartPoint[] {
  const normalized = normalizeSeries(values);
  const denominator = Math.max(1, values.length - 1);
  return normalized.map((value, index) => ({
    x: (index / denominator) * width,
    y: height - value * height,
  }));
}
