import {
  readFile,
  readdir,
} from "node:fs/promises";
import { extname, join } from "node:path";

const roots = [
  ".github",
  "apps",
  "config",
  "docker",
  "docs",
  "packages",
  "programs",
  "scripts",
  "services",
  "skills",
  "utilities",
];

const ignoredDirs = new Set([
  "node_modules",
  ".next",
  ".venv",
  "dist",
  "target",
  "coverage",
]);

const textExtensions = new Set([
  ".md", ".json", ".jsonc", ".js", ".mjs", ".cjs",
  ".ts", ".tsx", ".sh", ".yml", ".yaml", ".toml",
  ".env", ".txt", ".rs", ".css", ".html",
]);

const rules = [
  {
    id: "npm-token",
    pattern: /\bnpm_[A-Za-z0-9]{30,}\b/g,
  },
  {
    id: "npm-auth-token-literal",
    pattern: /_authToken\s*=\s*(?!\$\{|<|REPLACE|YOUR_)[^\s#]+/gi,
  },
  {
    id: "private-key-pem",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    id: "github-token",
    pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g,
  },
];

const findings = [];

async function walk(path) {
  let entries;
  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".env") && entry.name !== ".env.example") {
      continue;
    }
    if (ignoredDirs.has(entry.name)) continue;

    const file = join(path, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
      continue;
    }
    if (!entry.isFile()) continue;

    const extension = extname(entry.name);
    if (!textExtensions.has(extension) && entry.name !== ".npmrc") {
      continue;
    }

    const source = await readFile(file, "utf8").catch(() => null);
    if (source == null) continue;

    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(source)) {
        findings.push(`${file}: ${rule.id}`);
      }
    }
  }
}

for (const root of roots) {
  await walk(root);
}

if (findings.length) {
  console.error("Potential committed secrets detected:");
  for (const finding of findings) console.error(`  - ${finding}`);
  process.exit(1);
}

console.log("Secret scan: no committed token/private-key patterns detected");
