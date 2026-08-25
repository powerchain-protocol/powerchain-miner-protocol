import {
  cp,
  lstat,
  mkdir,
  readdir,
  rm,
  symlink,
} from "node:fs/promises";
import { homedir } from "node:os";
import { resolve, join } from "node:path";

const runtime = process.argv[2] ?? "all";
const copyMode = process.argv.includes("--copy");
const root = resolve("skills");

const targets = {
  codex: join(homedir(), ".agents", "skills"),
  claude: join(homedir(), ".claude", "skills"),
};

if (
  runtime !== "all" &&
  !Object.hasOwn(targets, runtime)
) {
  throw new Error(
    "usage: install-agent-skills.mjs codex|claude|all [--copy]",
  );
}

const skillNames = (
  await readdir(root, { withFileTypes: true })
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const [name, targetRoot] of Object.entries(targets)) {
  if (runtime !== "all" && runtime !== name) {
    continue;
  }

  await mkdir(targetRoot, { recursive: true });

  for (const skillName of skillNames) {
    const source = join(root, skillName);
    const target = join(targetRoot, skillName);

    try {
      const stat = await lstat(target);
      if (
        stat.isSymbolicLink() ||
        copyMode
      ) {
        await rm(target, {
          recursive: true,
          force: true,
        });
      } else {
        console.warn(
          `[skills] preserving unmanaged directory ${target}`,
        );
        continue;
      }
    } catch {
      // Does not exist.
    }

    if (copyMode) {
      await cp(source, target, {
        recursive: true,
      });
    } else {
      await symlink(source, target, "dir");
    }

    console.log(
      `[skills] ${name}: ${skillName} -> ${target}`,
    );
  }
}
