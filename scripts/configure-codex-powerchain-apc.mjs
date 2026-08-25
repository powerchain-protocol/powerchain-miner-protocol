import {
  mkdir,
  readFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  exists,
  restoreFromState,
  saveRestorePoint,
} from "../utilities/model-routing/config-state.mjs";

const command = process.argv[2] ?? "status";
const force = process.argv.includes("--force");
const model =
  process.env.POWERCHAIN_COMPUTE_MODEL ??
  process.env.MODEL ??
  "openai-gpt-55";

const codexHome =
  process.env.CODEX_HOME ??
  join(homedir(), ".codex");
const target = join(codexHome, "config.toml");
const statePath = join(
  codexHome,
  ".powerchain-apc-state.json",
);

const proxyBase =
  process.env.POWERCHAIN_CODEX_PROXY_BASE_URL ??
  "http://127.0.0.1:3210/v1";
const keyEnv =
  process.env.POWERCHAIN_COMPUTE_API_KEY
    ? "POWERCHAIN_COMPUTE_API_KEY"
    : process.env.VIRTUALS_API_KEY
      ? "VIRTUALS_API_KEY"
      : "POWERCHAIN_COMPUTE_API_KEY";

function stripRootKeys(source) {
  const lines = source.split(/\r?\n/);
  let inTable = false;
  const out = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\[/.test(trimmed)) {
      inTable = true;
    }

    if (
      !inTable &&
      /^(model|model_provider|model_context_window)\s*=/.test(
        trimmed,
      )
    ) {
      continue;
    }
    out.push(line);
  }

  return out.join("\n").trimEnd();
}

function removeManagedProvider(source) {
  const lines = source.split(/\r?\n/);
  const out = [];
  let skip = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed ===
      "[model_providers.powerchain_apc]"
    ) {
      skip = true;
      continue;
    }
    if (skip && /^\[/.test(trimmed)) {
      skip = false;
    }
    if (!skip) out.push(line);
  }
  return out.join("\n").trimEnd();
}

if (command === "status") {
  console.log(
    JSON.stringify(
      {
        enabled: await exists(statePath),
        target,
        proxyBase,
        model,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (command === "off") {
  const result = await restoreFromState({
    statePath,
    force,
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (command !== "on") {
  throw new Error(
    "usage: configure-codex-powerchain-apc.mjs on|off|status [--force]",
  );
}

await mkdir(codexHome, { recursive: true });
const original = (await exists(target))
  ? await readFile(target, "utf8")
  : "";

const preserved = removeManagedProvider(
  stripRootKeys(original),
);

const installed = [
  `model = "${model}"`,
  `model_provider = "powerchain_apc"`,
  "",
  preserved,
  preserved ? "" : "",
  "[model_providers.powerchain_apc]",
  'name = "PowerChain Agent Compute"',
  `base_url = "${proxyBase}"`,
  `env_key = "${keyEnv}"`,
  'wire_api = "responses"',
  'requires_openai_auth = false',
  "",
].join("\n");

await saveRestorePoint({
  target,
  statePath,
  installedText: installed,
  metadata: {
    model,
    proxyBase,
    keyEnv,
  },
});

console.log(
  JSON.stringify(
    {
      enabled: true,
      target,
      model,
      provider: "powerchain_apc",
      proxyBase,
      note:
        "Start the Codex proxy before launching Codex.",
    },
    null,
    2,
  ),
);
