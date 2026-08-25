import {
  readFile,
  readdir,
  stat,
} from "node:fs/promises";
import { join } from "node:path";

const root = "skills";
const entries = await readdir(root, {
  withFileTypes: true,
});
const skills = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (!skills.length) {
  throw new Error("No shared skills found.");
}

for (const name of skills) {
  const dir = join(root, name);
  const skillPath = join(dir, "SKILL.md");
  const metadataPath = join(dir, "metadata.json");

  await stat(skillPath);
  await stat(metadataPath);

  const metadata = JSON.parse(
    await readFile(metadataPath, "utf8"),
  );

  if (metadata.name !== name) {
    throw new Error(
      `${metadataPath}: metadata.name must equal ${name}`,
    );
  }

  const skill = await readFile(skillPath, "utf8");
  if (!skill.trim().startsWith("#")) {
    throw new Error(
      `${skillPath}: expected a Markdown title`,
    );
  }

  if (
    /pc_compute_[A-Za-z0-9_-]{20,}/.test(skill)
  ) {
    throw new Error(
      `${skillPath}: looks like it contains a real compute secret`,
    );
  }
}

console.log(
  `Skills: ${skills.length} canonical skill packages OK`,
);
