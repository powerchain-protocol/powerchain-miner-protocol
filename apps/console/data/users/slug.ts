export function userSlug(input: {
  displayName?: string | null;
  email: string;
}): string {
  const source = input.displayName?.trim() || input.email.split("@")[0];
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "user";
}
