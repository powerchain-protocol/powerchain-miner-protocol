import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const catalog = JSON.parse(
  await readFile(
    "config/compute-models.production.json",
    "utf8",
  ),
);

test("production catalog contains the supplied 16 model ids and contexts", () => {
  const expected = new Map([
    ["venice-uncensored-1-2", 128000],
    ["claude-opus-4-7", 1000000],
    ["claude-opus-4-7-fast", 1000000],
    ["claude-opus-4-8", 1000000],
    ["claude-sonnet-4-6", 1000000],
    ["deepseek-v4-flash", 1000000],
    ["deepseek-v4-pro", 1000000],
    ["minimax-m27", 198000],
    ["minimax-m3", 500000],
    ["openai-gpt-54-mini", 400000],
    ["openai-gpt-55", 1000000],
    ["openai-gpt-55-pro", 1000000],
    ["xiaomi-mimo-v2-5", 1000000],
    ["zai-org-glm-4.6", 198000],
    ["zai-org-glm-5-1", 200000],
    ["zai-org-glm-5-2", 1000000],
  ]);

  assert.equal(catalog.models.length, expected.size);

  for (const model of catalog.models) {
    assert.equal(
      model.contextLength,
      expected.get(model.id),
      model.id,
    );
    assert.equal(typeof model.name, "string");
    assert.ok(model.name.length > 0);
    assert.equal(typeof model.description, "string");
    assert.ok(model.description.length > 0);
  }
});

test("v1.3 model discovery is a forward migration", async () => {
  const v12 = await readFile(
    "apps/backend/migrations/008_v120_agent_compute.sql",
    "utf8",
  );
  const v13 = await readFile(
    "apps/backend/migrations/009_v130_model_discovery.sql",
    "utf8",
  );

  assert.match(v12, /upstream_model text NOT NULL/);
  assert.match(v13, /display_name/);
  assert.match(v13, /context_length/);
  assert.match(
    v13,
    /compute_models_executable_route_complete/,
  );
});

test("Codex switcher restores the prior global config exactly", async () => {
  const home = await mkdtemp(
    join(tmpdir(), "powerchain-codex-"),
  );
  const codexHome = join(home, ".codex");
  const config = join(codexHome, "config.toml");

  try {
    spawnSync("mkdir", ["-p", codexHome], {
      stdio: "inherit",
    });

    const original =
      'model = "gpt-5.6"\napproval_policy = "on-request"\n';
    await writeFile(config, original);

    let result = spawnSync(
      "node",
      [
        "scripts/configure-codex-powerchain-apc.mjs",
        "on",
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          HOME: home,
          CODEX_HOME: codexHome,
          MODEL: "openai-gpt-55",
        },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);

    const enabled = await readFile(config, "utf8");
    assert.match(
      enabled,
      /model_provider = "powerchain_apc"/,
    );
    assert.match(enabled, /wire_api = "responses"/);

    result = spawnSync(
      "node",
      [
        "scripts/configure-codex-powerchain-apc.mjs",
        "off",
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          HOME: home,
          CODEX_HOME: codexHome,
        },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await readFile(config, "utf8"),
      original,
    );
  } finally {
    await rm(home, {
      recursive: true,
      force: true,
    });
  }
});

test("Claude router template never stores a plaintext compute secret", async () => {
  const config = await readFile(
    "utilities/model-routing/claude-virtuals-router/config.example.json",
    "utf8",
  );

  assert.match(
    config,
    /\$POWERCHAIN_COMPUTE_API_KEY/,
  );
  assert.doesNotMatch(
    config,
    /pc_compute_[A-Za-z0-9_-]{20,}/,
  );
});
