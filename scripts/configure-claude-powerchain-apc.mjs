import {
  readFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { resolve, join } from "node:path";
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
  "claude-sonnet-4-6";
const keyEnv =
  process.env.POWERCHAIN_COMPUTE_API_KEY
    ? "POWERCHAIN_COMPUTE_API_KEY"
    : process.env.VIRTUALS_API_KEY
      ? "VIRTUALS_API_KEY"
      : "POWERCHAIN_COMPUTE_API_KEY";

const target = join(
  homedir(),
  ".claude-code-router",
  "config.json",
);
const statePath = join(
  homedir(),
  ".claude-code-router",
  ".powerchain-apc-state.json",
);

if (command === "status") {
  console.log(
    JSON.stringify(
      {
        enabled: await exists(statePath),
        target,
        model,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (command === "off") {
  console.log(
    JSON.stringify(
      await restoreFromState({
        statePath,
        force,
      }),
      null,
      2,
    ),
  );
  process.exit(0);
}

if (command !== "on") {
  throw new Error(
    "usage: configure-claude-powerchain-apc.mjs on|off|status [--force]",
  );
}

const templatePath = resolve(
  "utilities/model-routing/claude-virtuals-router/config.example.json",
);
const template = JSON.parse(
  await readFile(templatePath, "utf8"),
);

template.Providers[0].models = [model];
template.Providers[0].api_key = `$${keyEnv}`;
template.Router.default =
  `powerchain-apc,${model}`;
template.Router.background =
  `powerchain-apc,${model}`;
template.Router.think =
  `powerchain-apc,${model}`;
template.Router.longContext =
  `powerchain-apc,${model}`;

const installed =
  JSON.stringify(template, null, 2) + "\n";

await saveRestorePoint({
  target,
  statePath,
  installedText: installed,
  metadata: {
    model,
    router: "claude-code-router",
    keyEnv,
  },
});

console.log(
  JSON.stringify(
    {
      enabled: true,
      target,
      model,
      next:
        "Run ccr restart (or ccr start) and then ccr code.",
    },
    null,
    2,
  ),
);
