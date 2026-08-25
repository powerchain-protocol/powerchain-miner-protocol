export function normalizeUserId(value: string): string {
  const id = value.trim();
  if (!id) throw new Error("User id is required.");
  return id;
}
