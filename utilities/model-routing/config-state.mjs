import {
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname } from "node:path";

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export function sha256(text) {
  return createHash("sha256")
    .update(text, "utf8")
    .digest("hex");
}

export async function readText(path) {
  return (await exists(path))
    ? readFile(path, "utf8")
    : "";
}

export async function saveRestorePoint(input) {
  const {
    target,
    statePath,
    installedText,
    metadata = {},
  } = input;

  await mkdir(dirname(target), { recursive: true });
  await mkdir(dirname(statePath), { recursive: true });

  if (await exists(statePath)) {
    throw new Error(
      `PowerChain routing is already enabled for ${target}. Disable it before enabling again.`,
    );
  }

  const originalExists = await exists(target);
  const original = originalExists
    ? await readFile(target, "utf8")
    : "";

  const backup =
    `${target}.powerchain-apc.${Date.now()}.bak`;

  if (originalExists) {
    await copyFile(target, backup);
  }

  await writeFile(target, installedText, {
    mode: 0o600,
  });

  await writeFile(
    statePath,
    JSON.stringify(
      {
        version: 1,
        target,
        backup: originalExists
          ? backup
          : null,
        originalExists,
        installedSha256:
          sha256(installedText),
        enabledAt:
          new Date().toISOString(),
        ...metadata,
      },
      null,
      2,
    ) + "\n",
    {
      mode: 0o600,
    },
  );
}

export async function restoreFromState(input) {
  const {
    statePath,
    force = false,
  } = input;

  if (!(await exists(statePath))) {
    return {
      restored: false,
      reason: "not-enabled",
    };
  }

  const state = JSON.parse(
    await readFile(statePath, "utf8"),
  );

  const current = await readText(state.target);
  const currentHash = sha256(current);

  if (
    !force &&
    currentHash !== state.installedSha256
  ) {
    throw new Error(
      `Refusing to restore ${state.target}: it changed after PowerChain routing was enabled. Re-run with --force only after reviewing those changes.`,
    );
  }

  if (state.originalExists && state.backup) {
    await copyFile(state.backup, state.target);
  } else {
    const disabled =
      `${state.target}.powerchain-apc.disabled.${Date.now()}`;
    if (await exists(state.target)) {
      await rename(state.target, disabled);
    }
  }

  const retired =
    `${statePath}.disabled.${Date.now()}`;
  await rename(statePath, retired);

  return {
    restored: true,
    target: state.target,
    backup: state.backup,
  };
}
