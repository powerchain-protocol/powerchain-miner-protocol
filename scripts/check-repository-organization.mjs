import {
  readdir,
  readFile,
  stat,
} from "node:fs/promises";
import { join } from "node:path";

const requiredTopLevel = [
  "apps",
  "packages",
  "programs",
  "services",
  "skills",
  "utilities",
  "scripts",
  "config",
  "docker",
  "docs",
  "tests",
];

const requiredDocs = [
  "docs/PROJECT-STRUCTURE.md",
  "docs/history/README.md",
  "docs/history/migrations",
  "docs/history/working-iterations",
];

const requiredConsoleBarrels = [
  "apps/console/components/index.ts",
  "apps/console/components/ui/index.ts",
  "apps/console/data/index.ts",
  "apps/console/hooks/index.ts",
  "apps/console/lib/index.ts",
  "apps/console/types/index.ts",
  "apps/console/utils/index.ts",
];

const failures = [];

for (const path of [
  ...requiredTopLevel,
  ...requiredDocs,
  ...requiredConsoleBarrels,
]) {
  try {
    await stat(path);
  } catch {
    failures.push(`missing required path: ${path}`);
  }
}

const docsRoot = await readdir("docs");
for (const entry of docsRoot) {
  if (
    /^RELEASE-NOTES-v1\.(?:1|2|3)(?:\.1)?\.md$/.test(entry) ||
    /^MIGRATION-v/.test(entry)
  ) {
    failures.push(
      `historical document must live under docs/history/: docs/${entry}`,
    );
  }
}

const rootPackage = JSON.parse(
  await readFile("package.json", "utf8"),
);
if (rootPackage.version !== "1.0.0") {
  failures.push(
    `root package version must remain canonical 1.0.0, got ${rootPackage.version}`,
  );
}
if (
  rootPackage.packageManager !==
  "pnpm@11.23.0"
) {
  failures.push(
    `packageManager must remain pnpm@11.23.0, got ${rootPackage.packageManager}`,
  );
}

const rootReadme = await readFile(
  "README.md",
  "utf8",
);
if (
  rootReadme.includes(
    "docs/MIGRATION-v1.0.md",
  )
) {
  failures.push(
    "README.md still points at the old migration-history location",
  );
}

if (failures.length) {
  throw new Error(
    `Repository organization violations:\n- ${failures.join("\n- ")}`,
  );
}

console.log(
  "Repository organization: canonical top-level, docs history and console barrels verified",
);
