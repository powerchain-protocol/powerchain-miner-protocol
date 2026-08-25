import { readFile } from "node:fs/promises";

const source = await readFile(
  "pnpm-workspace.yaml",
  "utf8",
);

const expected = new Map([
  ["esbuild", "true"],
  ["bigint-buffer", "false"],
  ["bufferutil", "false"],
  ["utf-8-validate", "false"],
]);

if (!/strictDepBuilds:\s*true/.test(source)) {
  throw new Error(
    "pnpm-workspace.yaml must keep strictDepBuilds: true",
  );
}

if (!/verifyDepsBeforeRun:\s*warn/.test(source)) {
  throw new Error(
    "pnpm-workspace.yaml must keep verifyDepsBeforeRun: warn",
  );
}

for (const [name, value] of expected) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(
    `^\\s{2}["']?${escaped}["']?:\\s*${value}\\s*$`,
    "m",
  );
  if (!matcher.test(source)) {
    throw new Error(
      `pnpm build policy missing ${name}: ${value}`,
    );
  }
}

for (const legacy of [
  "onlyBuiltDependencies",
  "ignoredBuiltDependencies",
  "neverBuiltDependencies",
]) {
  if (source.includes(`${legacy}:`)) {
    throw new Error(
      `Deprecated pnpm build setting still present: ${legacy}`,
    );
  }
}

console.log(
  "pnpm build policy: reviewed dependencies are explicit",
);
